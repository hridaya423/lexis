# Lexis Future Product Implementation Plan

> **Superseded 2026-09-19** by the implemented v0.2 architecture: the CLI stays Node
> (no Rust rewrite — inference is the bottleneck, not startup), the local runtime is
> prebuilt `llama-server` (not Python/MLX/vLLM), and shell auto mode stays default.
> The safety-kernel, manifest, and Apple-FM-helper ideas below were kept; the
> explicit-`lx`-only direction and the rewrite were dropped.

**Goal:** Rebuild Lexis as a lightweight, cross-platform terminal assistant with a zero-model-download Apple Foundation Models path on compatible Macs.

**Architecture:** Replace the default Node, Python, and detached-model-server installation with a signed cross-platform CLI and a one-shot Swift Foundation Models helper. Separate probabilistic planning, deterministic policy assessment, user authorization, and execution so that model output cannot reach the shell without an independently reviewed plan.

**Tech Stack:** Rust CLI, Swift and Foundation Models on macOS, Next.js 16, React 19, Tailwind CSS 4, Base UI, Motion for React, Phosphor Icons, Shiki, DAPI, Tart, and platform CI.

---

## Product direction

Lexis should become a lightweight, cross-platform terminal assistant with a first-class native path on macOS. A compatible Mac should install no model, no Python environment, and no background inference server. Downloadable models remain an explicit option for users who need them.

Lexis is the shortest safe path from intent to a reviewed terminal action:

> Ask in plain language. See exactly what will happen. Run it without giving up control of your terminal.

The six-month product push serves three audiences through progressive disclosure:

| User | Default experience |
| --- | --- |
| Terminal beginner | Plain-language intent, concise explanation, impact preview, and explicit confirmation |
| Everyday developer | Fast `lx <intent>` flow, deterministic read-only auto-run, and useful error recovery |
| Power user | Saved workflows, provider routing, scoped automation, JSON output, and policy configuration |

## Current problems

The present product asks for trust before it has earned it.

| Area | Current behavior | Why users uninstall |
| --- | --- | --- |
| Installation | The installer may install Node, npm, Homebrew, Python, a virtual environment, inference packages, and a model | A terminal helper creates a large and surprising system footprint |
| Model lifecycle | Setup starts a detached inference server, and later commands can restart and detach it again | There is no owned idle shutdown or visible process lifecycle |
| Shell integration | `auto` is the default and modifies Bash, Zsh, Fish, and PowerShell profiles | One install touches shells the user may never use |
| Built-in commands | Auto mode shadows `exit`, `install`, `kill`, and `uninstall` | Fundamental terminal behavior changes under the user |
| Execution | Low-risk model output can execute automatically | The same probabilistic system generates and classifies the command |
| Safety | Risk is model-driven and commands ultimately run through `shell: true` | Structural validation does not establish that a command is safe |
| Web retrieval | Web search is enabled by default | A local-first privacy claim has an undeclared network path |
| Uninstallation | Lexis searches shared model caches and removes matching paths | Ownership of every deleted artifact is not established by an install manifest |
| Reliability | There is no meaningful automated test suite | Installers, shell hooks, provider startup, and destructive execution lack regression protection |
| Audit trail | `appendAuditEvent` exists but is never called | The product reports an audit-log path without recording execution events |
| Website | The studio is three hard-coded presets with a 500 ms fake delay | The page demonstrates a simulation instead of the product |

The relevant implementation is concentrated in:

- `lexis/src/setup.mjs`
- `lexis/src/hooks.mjs`
- `lexis/src/index.mjs`
- `lexis/src/executor.mjs`
- `scripts/install/install.sh`
- `scripts/install/win.ps1`
- `components/command-studio.tsx`

## Product principles

- Explicit invocation is the default. Lexis never owns every line entered into the shell.
- The model proposes, deterministic policy decides, the user authorizes, and the executor runs.
- Installation is small and reversible.
- Privacy mode never changes silently.
- Every long-running process has one owner and a defined stop condition.
- The website proves behavior using the same contracts and fixtures as the product.
- Advanced automation requires explicit grants. Lexis does not infer grants from repeated use.

## Target user flow

The default command shows a compact plan before a write or process action:

```text
$ lx free port 3000

Plan
  Find the process listening on port 3000
  Send it a normal termination signal

Command
  lsof -ti tcp:3000 | xargs kill -TERM

Impact
  Process termination · current machine

Press Enter to run · E to edit · Esc to cancel
```

Read-only operations can run immediately when the deterministic policy engine proves that they are read-only:

```text
$ lx show node and npm versions
node v24.6.0
npm 11.5.1
```

Destructive or broad actions never accept a simple default confirmation:

```text
$ lx remove every untracked file

Blocked by policy
This can permanently delete files not tracked by Git.

Preview affected files with:
  git clean -nd

Run the preview instead? [Y/n]
```

### Interaction modes

- `lx <intent>` plans and runs under the current policy.
- `lx plan <intent>` never executes.
- `lx explain '<command>'` explains an existing command without running it.
- `lx fix` analyzes the most recent explicitly captured failure.
- `lx history` inspects local, redacted activity.
- `lx model` inspects or changes the intelligence provider.
- `lx workflow` saves, inspects, and runs parameterized workflows.
- `lx doctor` reports health and offers concrete repairs.
- `lx uninstall` removes only Lexis-owned artifacts through the installation manifest.

Command-not-found assistance can exist as an opt-in shell integration. It suggests `lx ...` and never executes a model plan automatically.

## Model strategy

The provider order must be visible and user-controlled.

| Platform | Default | Optional alternatives |
| --- | --- | --- |
| Compatible Apple Silicon Mac | Apple Foundation Models | BYOK cloud, user-installed MLX, or Ollama |
| Unsupported or older Mac | Setup choice | BYOK cloud or user-installed local model |
| Linux | Setup choice | BYOK cloud, Ollama, llama.cpp, or vLLM |
| Windows | Setup choice | BYOK cloud, Ollama, or llama.cpp |

On macOS 26 and later, Apple Foundation Models provides the system model, guided generation, streaming, and tool calling. It works only when Apple Intelligence and the required language or region are available. Lexis must branch on `SystemLanguageModel.availability` rather than assume support.

Apple describes the device-scale model as suitable for extraction, classification, summarization, and constrained generation. It is not intended for advanced reasoning or world knowledge. Command planning should split the work into smaller operations:

1. Classify the intent.
2. Select a constrained command pattern or request documentation.
3. Generate a typed plan.
4. Validate the plan independently.
5. Ask the model for an explanation only after the command shape is known.

Apple's `@Generable` and `@Guide` should replace the current JSON generation and model-driven JSON repair flow on compatible Macs. Guided generation provides structural correctness through constrained decoding. It does not establish command safety.

Primary Apple references:

- [Foundation Models framework](https://developer.apple.com/documentation/foundationmodels)
- [WWDC25: Meet the Foundation Models framework](https://developer.apple.com/videos/play/wwdc2025/286)

### Privacy routing rules

- Never switch from on-device inference to cloud inference without confirmation.
- Never download a local model as a fallback.
- Show the active provider before the first request and in `lx model status`.
- Store API keys in Keychain, Credential Manager, or the Linux secret service, never plain JSON.
- Keep web retrieval off until the user requests current information or explicitly enables it.
- Show network activity and source provenance when retrieval occurs.

## Target architecture

Replace the current Node and Python installation chain with a signed, single-binary CLI. Rust is the recommended cross-platform core because it provides predictable distribution, strong state modeling, low startup overhead, and no runtime installation.

```text
lexis/
  apps/
    web/                   Next.js website
  crates/
    lexis-cli/             Argument parsing and terminal presentation
    lexis-core/            Use-case orchestration and domain types
    lexis-policy/          Deterministic command analysis
    lexis-executor/        Approved process execution
    lexis-install/         Manifest, hooks, updates, and uninstall
    lexis-providers/       Remote and local provider adapters
  platform/
    macos-model-host/      Signed Swift Foundation Models helper
  contracts/
    fixtures/              Provider and website demonstration fixtures
  tests/
    evals/
    installers/
    shells/
```

These modules correspond to real change seams: multiple model providers, shells, operating systems, and a security-sensitive executor. Do not add generic controller, service, or repository layers.

### Core interfaces

```rust
trait Planner {
    async fn plan(&self, request: PlanRequest)
        -> Result<UnreviewedPlan, PlannerError>;
}

trait PolicyEngine {
    fn assess(
        &self,
        plan: UnreviewedPlan,
        context: ExecutionContext,
    ) -> PolicyDecision;
}

trait Executor {
    async fn execute(
        &self,
        plan: ApprovedPlan,
    ) -> Result<ExecutionReport, ExecutionError>;
}
```

The types enforce the lifecycle:

```text
UnreviewedPlan
      ↓ deterministic assessment
ReviewedPlan
      ↓ user approval or proven read-only policy
ApprovedPlan
      ↓ execution
ExecutionReport
```

An `UnreviewedPlan` cannot be passed to the executor. Model confidence remains diagnostic information and never grants execution authority.

### Apple adapter

The Swift helper is a signed, one-shot process that communicates through JSON Lines over standard input and output. It launches for a request, checks availability, produces a typed plan with guided generation, returns the result, and exits. It does not install a model or run as a permanent daemon.

A future optimization may keep the helper alive briefly, but only after startup measurements support the additional lifecycle code. If introduced, the idle timeout must be visible, configurable, and tested.

### Local model adapter

Local models become a managed capability:

```text
lx model install qwen-coder-small
lx model start
lx model stop
lx model remove qwen-coder-small
```

The runtime manager owns the child process, PID, logs, selected port, readiness checks, and shutdown. It must not detach an untracked process. The idle policy must be finite by default, with explicit `5m`, `manual`, and `never` options.

## Safety kernel

Apple tool calling must not connect directly to shell execution. The model outputs a proposed plan. It never receives an unrestricted `runCommand` tool.

The policy engine classifies commands using syntax and effects:

- Shell constructs: commands, arguments, pipelines, redirects, substitutions, globbing, and elevation.
- Filesystem effects: reads, creates, overwrites, deletes, recursive deletes, ownership changes, and permission changes.
- Process effects: inspections, signals, terminations, and service control.
- Package effects: inspections, installs, upgrades, removals, and remote script execution.
- Network effects: fetches, uploads, remote shells, and credential-bearing requests.
- System effects: startup configuration, shell profiles, disks, users, firewalls, and kernel settings.

### Policy outcomes

| Outcome | Behavior |
| --- | --- |
| Proven read-only | May run immediately after explicit `lx` invocation |
| Scoped reversible write | Preview and single confirmation |
| Scoped irreversible action | Preview and deliberate confirmation |
| Broad destructive action | Block by default and offer a safer preview |
| Unknown syntax or effect | Do not execute; explain why analysis failed |
| Policy violation | Block regardless of model confidence |

Pipelines, command substitution, `eval`, encoded PowerShell, remote scripts piped into shells, and privilege escalation increase scrutiny. Unknown commands are not low risk.

Remove model-generated rollback promises. Lexis can offer undo only when it owns a recovery mechanism, such as a file backup or transaction journal.

## Installation and ownership

The default macOS installation contains:

- The `lexis` binary.
- The signed Foundation Models helper.
- Shell completions.
- A versioned configuration file.
- An installation manifest.

It does not contain Node, Python, Homebrew, MLX, Hugging Face packages, or model weights.

The installation manifest records every Lexis-owned file and shell modification. Uninstall reads this manifest and removes only those artifacts. Shared Hugging Face and Ollama caches must never be scanned and deleted based on a matching model name.

Shell integration must:

- Modify only the active shell selected by the user.
- Install `lx` completion and optional command-not-found suggestions.
- Never redefine `exit`, `kill`, `install`, or `uninstall`.
- Use marked, idempotent blocks.
- Preserve file permissions and line endings.
- Show the exact file before changing it.
- Support `lx hooks diff`, `lx hooks install`, and `lx hooks remove`.

## Reliability requirements

These requirements are release gates rather than marketing claims.

| Requirement | Acceptance criterion |
| --- | --- |
| Clean install | No undeclared package-manager or runtime changes |
| Background ownership | No Lexis-owned process remains 30 seconds after a normal Apple-provider request |
| Uninstall correctness | A VM snapshot matches its pre-install state except for user-approved history |
| Structural plans | Provider contract tests reject every malformed response |
| Execution safety | No unreviewed plan can reach the executor at compile time |
| Provider failure | Unavailable Apple Intelligence produces a clear reason and setup choice |
| Privacy | A local-only request makes no outbound connection |
| Cancellation | `Ctrl-C` stops planning or execution and reaps child processes |
| Atomic configuration | Interrupted writes leave the previous valid configuration intact |
| Shell integrity | Repeated install and remove cycles produce identical profile content |
| Accessibility | Product and website work with keyboard, VoiceOver, reduced motion, increased contrast, and reduced transparency |
| Website performance | LCP stays under 2.5 seconds, INP under 200 ms, and CLS under 0.1 in release testing |

### Test program

- Add Rust unit tests for policy classification and state transitions.
- Add golden provider contracts for Apple, OpenAI-compatible APIs, Ollama, MLX, and llama.cpp.
- Add adversarial prompts for deletion, prompt injection, encoded commands, privilege escalation, and misleading confidence.
- Add end-to-end shell tests for Bash, Zsh, Fish, PowerShell, and command-not-found integration.
- Test installers on clean macOS VMs through Tart and on Windows and Linux CI images.
- Add fault injection for network loss, unavailable models, malformed output, port conflicts, interrupted downloads, full disks, and `Ctrl-C`.
- Test website interactions using the same plan fixtures as the CLI.
- Pin prompt evaluations to operating-system and system-model versions because Apple updates the on-device model with operating-system releases.

## Feature roadmap

Features follow trust and reliability.

### Foundation release

- Explicit `lx` invocation.
- Apple Foundation Models adapter.
- BYOK OpenAI-compatible provider.
- Deterministic policy engine.
- Plan, preview, edit, approve, and cancel flows.
- Local redacted history.
- Complete installation manifest and uninstall.
- Provider and privacy status.

### Developer workflow release

- `lx explain`.
- `lx fix` with explicit error capture.
- Git-aware impact previews.
- Package-manager adapters that cite installed package state.
- Shell completions.
- Configurable read-only auto-run.
- Offline mode.
- Source citations for current installation instructions.

### Power-user release

- Named workflows with typed parameters.
- Per-workflow capability grants.
- Project-local `.lexis.toml` configuration that requires trust on first use.
- JSON output and CI-safe plan mode.
- Provider routing by task class.
- Local-model lifecycle controls.
- Exportable, redacted execution reports.

Defer autonomous multi-step agents, unrestricted model tools, shared workflow marketplaces, and cloud accounts until the safety kernel and update system have production evidence.

## Website direction

The website is a premium developer-tool launch site for technical users. Its visual language combines Apple restraint, terminal precision, and tactile product motion.

```text
DESIGN_VARIANCE: 7
MOTION_INTENSITY: 6
VISUAL_DENSITY: 4
```

Use cold graphite, soft silver, and one mineral-blue accent. Light and dark modes preserve the same hierarchy. Use the system font stack or a deliberate neutral sans with a true coding mono face. Avoid terminal green, purple glows, fake glass cards, giant uppercase headings, animated noise, and fake browser chrome.

### Page structure

1. Add a compact nav with Product, Safety, Models, Docs, GitHub, and Download.
2. Build a split hero around the real interactive plan flow, not a screenshot.
3. Explain zero model download on compatible Macs with a truthful footprint comparison.
4. Add one scroll-linked intent-to-plan sequence for planner, policy, approval, and execution.
5. Demonstrate a dangerous request being converted into a preview.
6. Add a provider switcher for Apple on-device, local model, and BYOK cloud behavior.
7. Publish a trust ledger for files touched, processes started, network use, and uninstall behavior.
8. Show workflows for beginner, developer, and power-user modes.
9. Publish measured evaluations and compatibility only after real test results exist.
10. Finish with platform-aware installation and documentation links.

### Motion system

- Buttons respond on pointer-down with `scale(0.97)` over 100 to 140 ms.
- Popovers originate from their triggers.
- Product states use shared-layout transitions so intent, plan, approval, and result feel like one object changing state.
- The safety preview uses a clip reveal to expose affected resources.
- The provider switcher carries velocity when dragged and snaps with a critically damped spring.
- Sticky navigation uses a scroll-edge blur instead of a hard divider.
- Large scroll motion becomes opacity-only under reduced motion.
- Keyboard-triggered product actions remain immediate.
- No perpetual animation runs except a real active-generation indicator.

### Library decision

Do not combine every component library. The stack stays narrow so behavior and visual language remain coherent.

| Library | Use |
| --- | --- |
| Base UI | Accessible dialog, popover, tooltip, tabs, and menu behavior |
| Motion for React | Springs, layout transitions, gestures, and the single scroll narrative |
| Phosphor Icons | Existing, consistent icon family |
| Shiki | Server-rendered command syntax and annotations |
| Native CSS | Materials, scroll-edge effects, responsive layout, and reduced-transparency fallbacks |
| GSAP | Add only if Motion cannot express the final pinned sequence |

SmoothUI, Magic UI, Aceternity, React Three Fiber, Lenis, Lottie, and generic shadcn themes can supply references. They do not become dependencies without a specific interaction that pays for them.

## Launch film

The launch film is a 60-second product demonstration. It shows one request becoming a safe action and proves that the compatible Mac path uses the system model.

### Storyboard

| Time | Picture | Audio |
| --- | --- | --- |
| 0:00-0:04 | Empty terminal, blinking insertion point, then a plain-language request | One keystroke bed, no music yet |
| 0:04-0:10 | The request resolves into a structured plan | "You know what you want. Lexis handles the syntax." |
| 0:10-0:16 | Apple on-device provider appears; download size remains zero and network stays off | A restrained mechanical lock sound |
| 0:16-0:25 | Intent, command, explanation, and impact arrive as structured snapshots | Music enters with a low pulse |
| 0:25-0:34 | A destructive request is stopped; preview replaces execution | "The model proposes. Policy decides." |
| 0:34-0:41 | The user edits the plan and approves it | Press and release sounds synchronized to motion |
| 0:41-0:48 | macOS, Linux, and Windows commands cut on the same action | Faster rhythm, no platform-logo parade |
| 0:48-0:55 | Saved workflow, offline indicator, and local history | "Private by default. Configurable when you need more." |
| 0:55-1:00 | Product mark, `lx`, and download URL | Music resolves cleanly |

### Visual language

- Produce a 4K, 16:9 master at 24 or 30 fps.
- Use a graphite background, off-white typography, and the mineral-blue action color.
- Capture real UI from a release candidate.
- Use hard cuts for command execution and springs for state changes.
- Use depth only when it explains hierarchy.
- Exclude neon tunnels, generic AI orbs, fake code rain, gradient text, and trailer booms.
- Design captions inside the safe area instead of applying default captions after export.

### DAPI production workflow

`dapi` was unavailable when this plan was written. Treat live CLI help as authoritative during production.

1. Install DAPI through the editor skill's installation guide.
2. Run `dapi --help` and command-group help before authoring the project.
3. Start a fresh project and write a locked brief before mounting media.
4. Capture release-candidate product footage at native resolution.
5. Probe every capture with `dapi media probe`.
6. Generate filmstrips and waveforms to choose the strongest action beats.
7. Build the A-roll spine first with `<sequence>` groups.
8. Use `<html>` for UI motion graphics and overlays.
9. Keep product audio, interface sounds, and score in separate sequences.
10. Add captions only after the edit and voice timing are locked.
11. Use `dapi node capture` after every sequence to check framing, contrast, timing, and continuity.
12. Produce a 60-second master, 30-second cut, 15-second cut, 9:16 version, 1:1 version, and muted-caption version.
13. Render exports only after captured frames pass the visual brief.

## Six-month execution sequence

| Weeks | Work | Exit gate |
| --- | --- | --- |
| 1-2 | Freeze risky growth, build baseline evaluations, document install footprint, and define the threat model | Current failures reproduce in CI |
| 3-6 | Build the Rust CLI skeleton, configuration, installer manifest, and explicit shell integration | One binary installs and cleanly uninstalls on three platforms |
| 7-10 | Build the Swift Foundation Models helper and provider interface | A compatible Mac plans without a downloaded model or background server |
| 11-14 | Build the deterministic policy engine, reviewed-plan types, approval UX, and cancellation | The adversarial safety suite passes |
| 15-17 | Add the remote provider, optional local-runtime manager, and secret storage | Privacy mode and lifecycle behavior are observable and tested |
| 18-20 | Add explain, fix, history, workflows, project trust, and completions | Three audience journeys pass end to end |
| 21-22 | Build the website design system and real product demonstration | Mobile, desktop, accessibility, and performance gates pass |
| 23 | Stabilize the release candidate across Tart, Linux, and Windows | Signed artifacts and rollback-ready release |
| 24 | Produce the DAPI film, cutdowns, documentation, and launch packaging | The film uses final UI and every public claim has evidence |

Website production can begin around week 15 with contract fixtures. Final capture and launch-film work wait for the release candidate.

## Implementation tasks

### Task 1: Capture the current reliability baseline

**Files:**

- Create: `tests/evals/`
- Create: `tests/installers/`
- Create: `tests/shells/`
- Create: `docs/security/threat-model.md`
- Inspect: `lexis/src/`
- Inspect: `scripts/install/`

**Steps:**

1. Record every file, dependency, shell profile, model path, network request, and background process created by the current installer.
2. Add reproducible tests for the current install, setup, invocation, and uninstall flows.
3. Add adversarial prompts that exercise destructive commands and misleading model risk labels.
4. Run the tests and confirm that they expose the current lifecycle and safety failures.
5. Commit the baseline without changing product behavior.

### Task 2: Build the single-binary CLI foundation

**Files:**

- Create: `crates/lexis-cli/`
- Create: `crates/lexis-core/`
- Create: `crates/lexis-install/`
- Create: `Cargo.toml`

**Steps:**

1. Write failing tests for configuration loading, atomic writes, installation ownership, and clean uninstall.
2. Build the minimal `lexis` and `lx` command surface.
3. Add the versioned configuration and installation-manifest types.
4. Add explicit shell completion installation for one selected shell.
5. Verify that no Node or Python runtime is required.
6. Commit the working CLI foundation.

### Task 3: Establish the planning contract

**Files:**

- Create: `crates/lexis-core/src/plan.rs`
- Create: `crates/lexis-providers/`
- Create: `contracts/fixtures/`

**Steps:**

1. Write failing tests for `PlanRequest`, `UnreviewedPlan`, and provider errors.
2. Define the smallest provider interface that supports Apple, remote, and local adapters.
3. Add golden fixtures for valid, malformed, unavailable, and interrupted provider responses.
4. Make provider selection visible and prevent silent privacy-mode fallback.
5. Run contract tests.
6. Commit the planning contract.

### Task 4: Add the Apple Foundation Models helper

**Files:**

- Create: `platform/macos-model-host/`
- Modify: `crates/lexis-providers/`
- Test: `contracts/fixtures/apple/`

**Steps:**

1. Write Swift tests for each `SystemLanguageModel.availability` outcome.
2. Define the `@Generable` command-plan types.
3. Build a one-shot JSON Lines process interface.
4. Add cancellation and error mapping for guardrails, unsupported language, and context limits.
5. Verify that the helper exits after every request.
6. Verify that a compatible Mac downloads no Lexis model.
7. Commit the Apple adapter.

### Task 5: Build the deterministic policy engine

**Files:**

- Create: `crates/lexis-policy/`
- Modify: `crates/lexis-core/src/plan.rs`
- Test: `tests/evals/`

**Steps:**

1. Write failing tests for read-only, scoped-write, destructive, unknown, encoded, elevated, and remote-script commands.
2. Parse shell syntax and derive effects independently of model risk labels.
3. Produce `PolicyDecision` values that convert `UnreviewedPlan` into `ReviewedPlan`.
4. Prove through the type system that only approved plans can reach execution.
5. Run the adversarial evaluation suite.
6. Commit the safety kernel.

### Task 6: Build execution and cancellation

**Files:**

- Create: `crates/lexis-executor/`
- Modify: `crates/lexis-cli/`
- Test: `tests/shells/`

**Steps:**

1. Write failing tests for preview, approval, cancellation, non-zero exit, and child-process cleanup.
2. Build the plan, edit, approve, cancel, and execute terminal flow.
3. Add `Ctrl-C` propagation and child reaping.
4. Record local, redacted execution events with configurable retention.
5. Run tests on every supported shell.
6. Commit the execution flow.

### Task 7: Add optional providers and model lifecycle

**Files:**

- Modify: `crates/lexis-providers/`
- Create: `crates/lexis-providers/src/openai_compatible.rs`
- Create: `crates/lexis-providers/src/local_runtime.rs`

**Steps:**

1. Write failing tests for BYOK configuration, secret lookup, local start, local stop, idle shutdown, and failed readiness.
2. Add the OpenAI-compatible provider without silent fallback.
3. Add explicit local model installation and removal.
4. Ensure that the runtime manager owns every child process.
5. Verify idle shutdown and uninstall behavior.
6. Commit optional provider support.

### Task 8: Add developer and power-user workflows

**Files:**

- Modify: `crates/lexis-cli/`
- Modify: `crates/lexis-core/`
- Create: `crates/lexis-core/src/workflow.rs`

**Steps:**

1. Write failing tests for `explain`, `fix`, history, typed workflow parameters, project trust, and JSON plan output.
2. Implement the smallest complete version of each flow.
3. Require explicit capability grants for workflows that write, terminate, install, or access the network.
4. Add `.lexis.toml` trust prompts and scope rules.
5. Run end-to-end audience journeys.
6. Commit the workflow release.

### Task 9: Rebuild the website around real product behavior

**Files:**

- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Replace: `components/command-studio.tsx`
- Modify: `components/quick-install.tsx`
- Modify: `components/install-commands.tsx`
- Create: `components/product-demo/`

**Steps:**

1. Read the relevant Next.js 16 guides from `node_modules/next/dist/docs/` before changing application code.
2. Write interaction tests against shared plan fixtures.
3. Add the visual tokens and dual-mode accessibility behavior.
4. Build the real plan, policy, approval, and result demonstration.
5. Add the trust ledger, provider comparison, safety demo, workflow examples, and platform installer.
6. Add only motivated Motion interactions and reduced-motion alternatives.
7. Run accessibility, mobile, desktop, Lighthouse, and copy reviews.
8. Commit the website release.

### Task 10: Stabilize distribution and produce the launch film

**Files:**

- Create: release workflows under `.github/workflows/`
- Create: signed installer packaging
- Create: the DAPI project after checking live CLI help
- Modify: product documentation and download routes

**Steps:**

1. Test signed artifacts in fresh Tart, Windows, and Linux environments.
2. Verify install, update, provider failure, offline use, and uninstall.
3. Lock every public performance, privacy, and footprint claim to test evidence.
4. Capture the release-candidate product.
5. Assemble and verify the DAPI A-roll, overlays, sound, captions, and cutdowns.
6. Run final accessibility, security, reliability, and visual reviews.
7. Tag and publish the release only after every release gate passes.

## Release decision

Lexis 1.0 is ready when a new user on a compatible Mac can install it, run a useful command through Apple Foundation Models, inspect the action, uninstall it, and leave no model, runtime, background process, or unexplained shell modification behind.

That trust loop is the product. Features and launch polish follow after it passes.
