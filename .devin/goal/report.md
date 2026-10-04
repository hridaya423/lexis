# Goal report

## Objective
Continue improving the Lexis 0.5B terminal model (Qwen2.5-Coder-0.5B full fine-tune) as far as possible; use the Devin CLI locally for parallel data generation.

## Done (evidence in lexis/eval/reports, summary via `python3 lexis/eval/summary.py <tag>`)
- Data-pipeline bugs fixed: clustered short flags (`-sh`, `-la`, `-rn`) were rejected by verify.mjs (commit a37beb2); fixcmd rows all held a Docker-down error (regenerated, 3000 real-stderr rows); linux exec now unprivileged.
- Distilled everyday data from SWE-2 sessions on the Mac mini: round 1 (60 shards) + round 2 (72 shards) -> 14,552 verified rows (`~/lx-data/final/distill.jsonl`); round 3 (60 harder shards) in progress.
- Policy (safety/readonly classifier) fixes, 120/120 tests (commits e9714b0, bbf95ca, b9f1546, e4a85e3, b7a2954).
- Holdout split: holdout_a for selection, holdout_b untouched for the final report.
- Sweep results on holdout_a (992 cases, current harness p6):
  - first full FT (lx05): 527 (older harness), v3b (distill r1 x3): ~632 avg of 2 seeds (older harness)
  - v4a (distill r1+r2 x3): 698 / seed2 687; v4c (no paraphrase): 697
  - rejected: 2-3 epochs, lr 5e-5 and 1e-5, distill x6, dropping nl2sh-alfa, retrieval shots, voting/best-of-n; Q4 = Q5 = Q6 = Q8.

## Update (iteration 1)
- Distill round 3 complete (60/60 shards, 2 retried); verified distill set now 21,147 rows.
- v5 = all data (sft 54,268 + paraphrase 15,997 + crosslabel 3,266 + distill x3 62,502 + fixcmd 3,000 = 138,977) training on Modal (ap-W4WR8OYRF5qSC10o5W8G82), queued eval `~/lx-data/evalq/85-v5.sh`.
- Final eval queued (`~/lx-data/evalq/90-final.sh`): base, lx05, v4a, v5 on dev + holdout_a + holdout_b with one harness (tags f-*).
- Modal spend so far: $20.96 lx-sft (billing report); trainer memory cut to 16 GB.

- v5 result (holdout_a): 695/992 vs v4a 698 / v4a-s2 687 -> round 3 data is neutral; 0.5B plateau ~70% with this recipe. Pre-committed choice before seeing holdout_b: ship v5 (same score, broadest data coverage, best Windows 186/233).

- Final harness (tags f-*), holdout_b (untouched until now, 919 case-runs): base 164 (18%), first run lx05 487 (53%), v4a 634 (69%); v5 unix 443/669 vs v4a 449/669, windows pending. Base holdout_a unix crashed the evaluator (policy infinite loop on an unclosed backtick, fixed in fb710f2); base re-run queued (95-base-redo.sh).

- FINAL (one harness, tags f-*; `python3 lexis/eval/summary.py f-`):
  | model | dev (367) | holdout_a (992) | holdout_b (919, final) |
  |---|---|---|---|
  | base Qwen2.5-Coder-0.5B (Q8) | 200 (54%) | 198 (20%) | 164 (18%) |
  | lx05 first full FT | 306 (83%) | 541 (55%) | 487 (53%) |
  | v4a | 326 (89%) | 698 (70%) | 634 (69.0%) |
  | v5 (chosen before holdout_b) | 325 (89%) | 695 (70%) | 635 (69.1%) |
- Ship candidate: `~/lx-data/trained/v5-q4_k_m.gguf`, 397,807,712 bytes, sha256 111e53630185147c3d0cb8729ee49601310d8de04b961cda5f0395d50c483abb (also on Modal volume lx-models).

## In progress / remaining
- Distill round 3 on mini (34/60 at 08:25).
- Local Devin CLI: `devin auth status` reports Not logged in although credentials.toml exists; `devin auth login` browser flow started and is waiting for the user to approve in the browser.
- Next: verify round 3, train v5 (+seed 2), then final holdout_b eval of base / lx05 / v4a / v5 on one harness; add best model to `lexis/src/runtime/models.mjs` once the user names a Hugging Face repo.
