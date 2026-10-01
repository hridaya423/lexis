#!/usr/bin/env python3
"""Modal SFT pilot for lx-cmd.

Trains Qwen2.5-Coder-0.5B / 1.5B (LoRA r=64, response-only loss, 1 epoch) on a
chat-format JSONL, merges, converts to GGUF, quantizes Q4_K_M, and drops the
artifact on the `lx-models` volume.

  modal run train_modal.py --model Qwen/Qwen2.5-Coder-0.5B-Instruct \
      --data pilot.jsonl --out lx-pilot-0.5b

Pull the result: modal volume get lx-models lx-pilot-0.5b-q4_k_m.gguf ./
"""
import modal

TAG = "b11056"
LLAMA_URL = f"https://github.com/ggml-org/llama.cpp/releases/download/{TAG}/llama-{TAG}-bin-ubuntu-x64.tar.gz"

image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install("git", "curl", "tar", "unzip")
    .pip_install(
        "torch", "trl==0.21.0", "transformers", "peft", "datasets",
        "accelerate", "bitsandbytes", "sentencepiece", "gguf", "huggingface_hub",
    )
    .run_commands(
        # llama.cpp source for convert_hf_to_gguf.py + release binary for quantize.
        # (do NOT pip install its requirements.txt — it pins a different torch)
        "git clone --depth 1 https://github.com/ggml-org/llama.cpp /opt/llama.cpp",
        "pip install protobuf",
        f"cd /opt && curl -L {LLAMA_URL} -o llama.tar.gz && tar xzf llama.tar.gz && find /opt -name llama-quantize -type f -exec cp {{}} /usr/local/bin/ \\; && llama-quantize --help | head -1",
    )
)

app = modal.App("lx-sft", image=image)
vol = modal.Volume.from_name("lx-models", create_if_missing=True)
data_vol = modal.Volume.from_name("lx-data", create_if_missing=True)


@app.function(gpu="A10G", timeout=6 * 3600, volumes={"/models": vol, "/data": data_vol}, memory=32768)
def train(model_id: str, data_name: str, out_name: str, epochs: float = 1.0, lr: float = 2e-4):
    import json, os, subprocess
    from datasets import Dataset
    from transformers import AutoTokenizer
    from trl import SFTConfig, SFTTrainer

    tok = AutoTokenizer.from_pretrained(model_id)
    eos = tok.eos_token or "<|endoftext|>"

    def to_pc(r):
        msgs = r["messages"]
        prompt = tok.apply_chat_template(msgs[:-1], tokenize=False, add_generation_prompt=True)
        return {"prompt": prompt, "completion": msgs[-1]["content"] + eos}

    rows = [json.loads(l) for l in open(f"/data/{data_name}") if l.strip()]
    ds = Dataset.from_list([to_pc(r) for r in rows])
    print(f"dataset: {len(ds)} rows")

    cfg = SFTConfig(
        output_dir="/tmp/ckpt",
        num_train_epochs=epochs,
        learning_rate=lr,
        per_device_train_batch_size=16,
        gradient_accumulation_steps=4,
        max_length=1024,
        completion_only_loss=True,
        packing=False,
        bf16=True,
        logging_steps=25,
        save_strategy="no",
        report_to=[],
        seed=7,
    )
    from peft import LoraConfig
    trainer = SFTTrainer(
        model=model_id,
        args=cfg,
        train_dataset=ds,
        peft_config=LoraConfig(r=64, lora_alpha=128, lora_dropout=0.0,
                               target_modules="all-linear", task_type="CAUSAL_LM"),
    )
    trainer.train()

    merged = "/tmp/merged"
    trainer.model.merge_and_unload().save_pretrained(merged)
    tok.save_pretrained(merged)

    gguf_f16 = f"/models/{out_name}-f16.gguf"
    subprocess.run(["python3", "/opt/llama.cpp/convert_hf_to_gguf.py", merged,
                    "--outfile", gguf_f16, "--outtype", "f16"], check=True)
    subprocess.run(["llama-quantize", gguf_f16, f"/models/{out_name}-q4_k_m.gguf", "Q4_K_M"], check=True)
    os.remove(gguf_f16)
    vol.commit()
    print(f"wrote /models/{out_name}-q4_k_m.gguf")


@app.local_entrypoint()
def main(model: str = "Qwen/Qwen2.5-Coder-0.5B-Instruct", data: str = "pilot.jsonl",
         out: str = "lx-pilot", epochs: float = 1.0, lr: float = 2e-4):
    train.remote(model, data, out, epochs, lr)
