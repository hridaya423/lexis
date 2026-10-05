#!/usr/bin/env python3
"""Modal SFT pilot for lx-cmd.

Trains Qwen2.5-Coder-0.5B / 1.5B (LoRA r=64, response-only loss, 1 epoch) on a
chat-format JSONL, merges, converts to GGUF, quantizes Q4_K_M + Q8_0, and drops
the artifacts on the `lx-models` volume.

  modal run train_modal.py --model Qwen/Qwen2.5-Coder-0.5B-Instruct \
      --data sft_train_chat.jsonl --out lx-05b

CPU smoke run (no GPU credits):

  modal run train_modal.py --cpu --model Qwen/Qwen2.5-Coder-0.5B-Instruct \
      --data sft_train_chat.jsonl --limit 64 --max-steps 4 --out smoke

Pull the result: modal volume get lx-models lx-05b-q4_k_m.gguf ./
"""
import modal

TAG = "b11056"
LLAMA_URL = f"https://github.com/ggml-org/llama.cpp/releases/download/{TAG}/llama-{TAG}-bin-ubuntu-x64.tar.gz"
QUANTIZE_BIN = f"/opt/llama-{TAG}/llama-quantize"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "curl", "tar", "unzip")
    .pip_install(
        "torch",
        "trl==0.21.0",
        "transformers==4.56.2",
        "peft==0.17.1",
        "accelerate==1.10.1",
        "datasets==4.0.0",
        "bitsandbytes",
        "sentencepiece",
        "gguf",
        "huggingface_hub",
    )
    .run_commands(
        # llama.cpp source for convert_hf_to_gguf.py + release binary for quantize.
        # (do NOT pip install its requirements.txt — it pins a different torch)
        "git clone --depth 1 https://github.com/ggml-org/llama.cpp /opt/llama.cpp",
        "pip install protobuf",
        f"cd /opt && curl -L {LLAMA_URL} -o llama.tar.gz && tar xzf llama.tar.gz "
        f"&& ln -sf {QUANTIZE_BIN} /usr/local/bin/llama-quantize "
        "&& llama-quantize --help | head -1",
    )
)

app = modal.App("lx-sft", image=image)
vol = modal.Volume.from_name("lx-models", create_if_missing=True)
data_vol = modal.Volume.from_name("lx-data", create_if_missing=True)


def _export_gguf(merged, out_name, calib_texts):
    """HF dir at `merged` -> f16 GGUF -> imatrix -> quants, all on lx-models vol."""
    import subprocess

    gguf_f16 = f"/models/{out_name}-f16.gguf"
    subprocess.run(["python3", "/opt/llama.cpp/convert_hf_to_gguf.py", merged,
                    "--outfile", gguf_f16, "--outtype", "f16"], check=True)
    calib = "/tmp/calib.txt"
    with open(calib, "w") as f:
        for t in calib_texts:
            f.write(t + "\n")
    imatrix = f"/models/{out_name}-imatrix.dat"
    subprocess.run([f"/opt/llama-{TAG}/llama-imatrix", "-m", gguf_f16, "-f", calib,
                    "-o", imatrix, "-c", "512", "-t", "8"], check=True)
    for quant in ("q4_k_m", "q5_k_m", "q6_k", "q8_0"):
        subprocess.run(["llama-quantize", "--imatrix", imatrix, gguf_f16,
                        f"/models/{out_name}-{quant}.gguf", quant.upper()], check=True)
    vol.commit()
    print(f"wrote /models/{out_name}-{{f16,q4_k_m,q5_k_m,q6_k,q8_0}}.gguf")


def _train(model_id, data_name, out_name, epochs, lr, max_steps, limit, use_bf16, eval_data, full, seed=7, eval_steps=200):
    import glob
    import json
    import os

    from datasets import Dataset
    from transformers import AutoTokenizer
    from trl import SFTConfig, SFTTrainer

    lr = lr or (2e-5 if full else 2e-4)
    tok = AutoTokenizer.from_pretrained(model_id)
    eos = tok.eos_token or "<|endoftext|>"

    def to_pc(r):
        msgs = r["messages"]
        prompt = tok.apply_chat_template(msgs[:-1], tokenize=False, add_generation_prompt=True)
        return {"prompt": prompt, "completion": msgs[-1]["content"] + eos}

    rows = [json.loads(l) for l in open(f"/data/{data_name}") if l.strip()]
    if limit:
        rows = rows[:limit]
    ds = Dataset.from_list([to_pc(r) for r in rows])
    print(f"dataset: {len(ds)} rows")

    val_rows = [json.loads(l) for l in open(f"/data/{eval_data}") if l.strip()]
    val_ds = Dataset.from_list([to_pc(r) for r in val_rows]).shuffle(seed=7)
    val_ds = val_ds.select(range(min(2000, len(val_ds))))
    print(f"eval: {len(val_ds)} rows")

    output_dir = f"/models/ckpt/{out_name}"
    cfg = SFTConfig(
        output_dir=output_dir,
        num_train_epochs=epochs,
        max_steps=max_steps,
        learning_rate=lr,
        per_device_train_batch_size=8,
        gradient_accumulation_steps=8,
        max_length=1024,
        completion_only_loss=True,
        packing=False,
        bf16=use_bf16,
        logging_steps=25,
        save_strategy="steps",
        save_steps=eval_steps,
        save_total_limit=2,
        eval_strategy="steps",
        eval_steps=eval_steps,
        per_device_eval_batch_size=16,
        gradient_checkpointing=full,
        report_to=[],
        seed=seed,
    )
    peft_config = None
    if not full:
        from peft import LoraConfig
        peft_config = LoraConfig(r=64, lora_alpha=128, lora_dropout=0.0,
                                 target_modules="all-linear", task_type="CAUSAL_LM")
    trainer = SFTTrainer(
        model=model_id,
        args=cfg,
        train_dataset=ds,
        eval_dataset=val_ds,
        peft_config=peft_config,
    )

    batch = next(iter(trainer.get_train_dataloader()))
    ids = batch["input_ids"][0]
    if "labels" in batch:
        mask = batch["labels"][0] != -100
    else:
        mask = batch["completion_mask"][0].bool()
    supervised = tok.decode(ids[mask])
    completions = {r["messages"][-1]["content"] + eos for r in rows}
    print(f"supervised tokens (batch row 0): {supervised!r}")
    if supervised not in completions:
        raise RuntimeError(f"masking mismatch: supervised={supervised!r} is not a bare completion")

    ckpts = sorted(glob.glob(f"{output_dir}/checkpoint-*"),
                   key=lambda p: int(p.rsplit("-", 1)[1]))
    resume = ckpts[-1] if ckpts else None
    if resume:
        print(f"resuming from {resume}")
    trainer.train(resume_from_checkpoint=resume)

    try:
        import torch
        print(f"peak GPU mem: {torch.cuda.max_memory_allocated()/1e9:.2f} GB; "
              f"dtype={next(trainer.model.parameters()).dtype}")
    except Exception as e:
        print(f"mem probe unavailable: {e}")

    metrics = trainer.evaluate()
    print(f"eval loss: {metrics.get('eval_loss')}")

    merged = f"/models/hf/{out_name}"
    if full:
        trainer.model.save_pretrained(merged)
    else:
        trainer.model.merge_and_unload().save_pretrained(merged)
    tok.save_pretrained(merged)
    calib = [tok.apply_chat_template(r["messages"], tokenize=False) for r in rows[:600]]
    _export_gguf(merged, out_name, calib)


def _dpo(base, data_name, eval_data, out_name, beta, lr, epochs, rpo_alpha, max_steps, skip_export, seed=7, label_smoothing=0.0):
    import json

    import torch
    from datasets import Dataset
    from transformers import AutoModelForCausalLM, AutoTokenizer
    from trl import DPOConfig, DPOTrainer

    model_path = f"/models/hf/{base}"
    tok = AutoTokenizer.from_pretrained(model_path)
    model = AutoModelForCausalLM.from_pretrained(model_path, torch_dtype=torch.bfloat16)

    def load(name):
        rows = [json.loads(l) for l in open(f"/data/{name}") if l.strip()]
        return Dataset.from_list([{ "prompt": r["prompt"], "chosen": r["chosen"],
                                    "rejected": r["rejected"] } for r in rows]), rows

    ds, rows = load(data_name)
    print(f"dataset: {len(ds)} pairs")
    val_ds, _ = load(eval_data)
    print(f"eval: {len(val_ds)} pairs")

    cfg = DPOConfig(
        output_dir=f"/models/ckpt/{out_name}",
        beta=beta,
        loss_type="sigmoid",
        rpo_alpha=rpo_alpha,
        label_smoothing=label_smoothing,
        learning_rate=lr,
        num_train_epochs=epochs,
        lr_scheduler_type="cosine",
        warmup_ratio=0.1,
        per_device_train_batch_size=8,
        gradient_accumulation_steps=2,
        max_length=512,
        max_prompt_length=384,
        logging_steps=10,
        eval_strategy="steps",
        eval_steps=20,
        save_strategy="no",
        seed=seed,
        report_to=[],
        bf16=True,
        gradient_checkpointing=True,
        max_steps=max_steps,
    )
    trainer = DPOTrainer(
        model=model,
        ref_model=None,  # full FT: TRL copies the model as the frozen reference
        args=cfg,
        train_dataset=ds,
        eval_dataset=val_ds,
        processing_class=tok,
    )

    def dpo_metrics(tag):
        m = trainer.evaluate()
        keys = ("rewards/chosen", "rewards/rejected", "rewards/accuracies",
                "logps/chosen", "logps/rejected")
        vals = {k: m.get(f"eval_{k}", m.get(k)) for k in keys}
        print(f"{tag}: " + "  ".join(f"{k}={vals[k]:.4f}" if isinstance(vals[k], float) else f"{k}={vals[k]}"
                                     for k in keys))
        return vals

    before = dpo_metrics("DPO BEFORE")
    trainer.train()
    after = dpo_metrics("DPO AFTER")
    print("DPO SUMMARY  " + "  ".join(
        f"{k}: {before.get(k)} -> {after.get(k)}" for k in before))

    if skip_export:
        print("skip_export: not saving model or GGUFs")
        return
    merged = f"/models/hf/{out_name}"
    trainer.model.save_pretrained(merged)
    tok.save_pretrained(merged)
    calib = [tok.apply_chat_template(r["prompt"] + r["chosen"], tokenize=False)
             for r in rows[:600]]
    _export_gguf(merged, out_name, calib)


@app.function(gpu="A10G", timeout=6 * 3600, volumes={"/models": vol, "/data": data_vol}, memory=16384)
def train(model_id: str, data_name: str, out_name: str, epochs: float = 1.0, lr: float = 0.0,
          max_steps: int = -1, limit: int = 0, eval_data: str = "sft_val_chat.jsonl", full: bool = False, seed: int = 7,
          eval_steps: int = 200):
    _train(model_id, data_name, out_name, epochs, lr, max_steps, limit, True, eval_data, full, seed, eval_steps)


@app.function(gpu="A10G", timeout=6 * 3600, volumes={"/models": vol, "/data": data_vol}, memory=16384)
def dpo_run(base: str = "v5", data: str = "dpo_train.jsonl", eval_data: str = "dpo_val.jsonl",
            out_name: str = "v5-dpo", beta: float = 0.1, lr: float = 1e-6, epochs: float = 2.0,
            rpo_alpha: float = 0.5, max_steps: int = -1, skip_export: bool = False, seed: int = 7,
            label_smoothing: float = 0.0):
    _dpo(base, data, eval_data, out_name, beta, lr, epochs, rpo_alpha, max_steps, skip_export, seed, label_smoothing)


@app.function(gpu="L40S", timeout=6 * 3600, volumes={"/models": vol, "/data": data_vol}, memory=32768)
def dpo_l40s(base: str = "v5", data: str = "dpo_train.jsonl", eval_data: str = "dpo_val.jsonl",
             out_name: str = "v5-dpo", beta: float = 0.1, lr: float = 1e-6, epochs: float = 2.0,
             rpo_alpha: float = 0.5, max_steps: int = -1, skip_export: bool = False, seed: int = 7,
             label_smoothing: float = 0.0):
    _dpo(base, data, eval_data, out_name, beta, lr, epochs, rpo_alpha, max_steps, skip_export, seed, label_smoothing)


@app.function(gpu="L40S", timeout=6 * 3600, volumes={"/models": vol, "/data": data_vol}, memory=32768)
def train_l40s(model_id: str, data_name: str, out_name: str, epochs: float = 1.0, lr: float = 0.0,
               max_steps: int = -1, limit: int = 0, eval_data: str = "sft_val_chat.jsonl", full: bool = False, seed: int = 7,
               eval_steps: int = 200):
    _train(model_id, data_name, out_name, epochs, lr, max_steps, limit, True, eval_data, full, seed, eval_steps)


@app.function(cpu=8, timeout=6 * 3600, volumes={"/models": vol, "/data": data_vol}, memory=32768)
def train_cpu(model_id: str, data_name: str, out_name: str, epochs: float = 1.0, lr: float = 0.0,
              max_steps: int = -1, limit: int = 0, eval_data: str = "sft_val_chat.jsonl", full: bool = False):
    _train(model_id, data_name, out_name, epochs, lr, max_steps, limit, False, eval_data, full)


@app.local_entrypoint()
def main(model: str = "Qwen/Qwen2.5-Coder-0.5B-Instruct", data: str = "sft_train_chat.jsonl",
         out: str = "lx-pilot", epochs: float = 0.0, lr: float = 0.0,
         cpu: bool = False, max_steps: int = -1, limit: int = 0,
         eval_data: str = "sft_val_chat.jsonl", full: bool = False, seed: int = 7,
         dpo: bool = False, base: str = "v5", beta: float = 0.1, rpo_alpha: float = 0.5,
         skip_export: bool = False, label_smoothing: float = 0.0, gpu: str = "A10G",
         eval_steps: int = 200):
    # epochs<=0 / lr<=0 mean "not overridden": SFT defaults 1 ep, DPO 2 ep / 1e-6
    if dpo:
        dpo_fn = dpo_l40s if gpu == "L40S" else dpo_run
        dpo_fn.remote(base=base, data=data, eval_data=eval_data, out_name=out,
                   beta=beta, lr=lr if lr > 0 else 1e-6,
                   epochs=epochs if epochs > 0 else 2.0,
                   rpo_alpha=rpo_alpha, max_steps=max_steps, skip_export=skip_export, seed=seed,
                   label_smoothing=label_smoothing)
    elif cpu:
        train_cpu.remote(model, data, out, epochs or 1.0, lr, max_steps, limit, eval_data, full)
    elif gpu == "L40S":
        train_l40s.remote(model, data, out, epochs or 1.0, lr, max_steps, limit, eval_data, full, seed, eval_steps)
    else:
        train.remote(model, data, out, epochs or 1.0, lr, max_steps, limit, eval_data, full, seed, eval_steps)
