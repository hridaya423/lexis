export const LLAMA_CPP_TAG = "b11056";

const BASE = `https://github.com/ggml-org/llama.cpp/releases/download/${LLAMA_CPP_TAG}`;

export const ASSETS = {
  "darwin-arm64-metal": { name: `llama-${LLAMA_CPP_TAG}-bin-macos-arm64.tar.gz`, sha256: "6be92d5704e2753e4c84999a4d1ba73abee5691d552ee839202cc12f4740ef9c", format: "tar.gz" },
  "darwin-x64-cpu": { name: `llama-${LLAMA_CPP_TAG}-bin-macos-x64.tar.gz`, sha256: "5eba00485580e3a60201b3443459a90a6fbc24d960e65ab9c27f51724a869795", format: "tar.gz" },
  "linux-x64-cpu": { name: `llama-${LLAMA_CPP_TAG}-bin-ubuntu-x64.tar.gz`, sha256: "74936888e975064d07e352745237508d4bef08d4b51843b01d011d58a4c4601a", format: "tar.gz" },
  "linux-x64-vulkan": { name: `llama-${LLAMA_CPP_TAG}-bin-ubuntu-vulkan-x64.tar.gz`, sha256: "9edceb8555da0bb24fe4f7fa531954461a17c3ac32a674d96ecaf0a6321305c8", format: "tar.gz" },
  "linux-arm64-cpu": { name: `llama-${LLAMA_CPP_TAG}-bin-ubuntu-arm64.tar.gz`, sha256: "33b94b479b0122a9556edc1007c3e2ac4f0bdf49179dfd8b13bf62b9e20329c8", format: "tar.gz" },
  "linux-arm64-vulkan": { name: `llama-${LLAMA_CPP_TAG}-bin-ubuntu-vulkan-arm64.tar.gz`, sha256: "81cea53ead58ebdb62961fd83ecb2214755e6f0e7b996684e60bc828652ead50", format: "tar.gz" },
  "win32-x64-cpu": { name: `llama-${LLAMA_CPP_TAG}-bin-win-cpu-x64.zip`, sha256: "a2668a200ca7271e66af0a54fd4376aaf8ae0b2a562cf7a63c41d8fd2a8245fa", format: "zip" },
  "win32-x64-vulkan": { name: `llama-${LLAMA_CPP_TAG}-bin-win-vulkan-x64.zip`, sha256: "b7b5ef4a1f47542635a3a5e3e471cbfcbaee057aa0c962f9573329ddd9168c5a", format: "zip" },
  "win32-arm64-cpu": { name: `llama-${LLAMA_CPP_TAG}-bin-win-cpu-arm64.zip`, sha256: "41e8d0bf0c5a1decb69ac84af8628dc750c4e31e1471a742dc65e264da0f159d", format: "zip" },
    "win32-arm64-cuda": {
    name: `llama-${LLAMA_CPP_TAG}-bin-win-cuda-13.4-arm64.zip`,
    sha256: "39d27da64af36d9b21cdd190c3f3e20a53e08bd5b951bf1ddc93a9929b158843",
    format: "zip",
    extra: [{ name: `cudart-llama-bin-win-cuda-13.4-arm64.zip`, sha256: "642dcde8805b3e3165ca710a5443b3b4044b27d96bd3ee3132473988c9bcb774", format: "zip" }],
  },
  "win32-x64-cuda": {
    name: `llama-${LLAMA_CPP_TAG}-bin-win-cuda-13.4-x64.zip`,
    sha256: "d8ac4b57035d6da67cc3e069104fd0d7c01e3be8d72e394e88951a959ffcef20",
    format: "zip",
    extra: [{ name: `cudart-llama-bin-win-cuda-13.4-x64.zip`, sha256: "738f8c251ac22b70c3ae6f83a10cf222725df0395246a2cf58f32bdb85fbe668", format: "zip" }],
  },
  "linux-x64-cuda": {
    name: `llama-${LLAMA_CPP_TAG}-bin-ubuntu-cuda-13.3-x64.tar.gz`,
    sha256: "7edc390553f7f7672c7d4438382f743d4f4f26e76526ea92a58299c91968787a",
    format: "tar.gz",
    extra: [{ name: `cudart-llama-${LLAMA_CPP_TAG}-bin-ubuntu-cuda-13.3-x64.tar.gz`, sha256: "33377182e9a7efdba031cc91cfe6ab6f85a6e36a087af98a8f492a8ca91d2e85", format: "tar.gz" }],
  },
  "linux-arm64-cuda": {
    name: `llama-${LLAMA_CPP_TAG}-bin-ubuntu-cuda-13.3-arm64.tar.gz`,
    sha256: "ed7687f14d5c62541efdec30b1eec85c46077558ba74e1ad556054f7b46737a1",
    format: "tar.gz",
    extra: [{ name: `cudart-llama-${LLAMA_CPP_TAG}-bin-ubuntu-cuda-13.3-arm64.tar.gz`, sha256: "4ed37f77e65fee119e01d41da6b15e48977e18b036b787ed50e498acca79ca22", format: "tar.gz" }],
  },
};

export function assetKeyFor({ platform, arch, backend }) {
  const b = backend || "cpu";
  if (platform === "darwin") {
    return arch === "arm64" ? "darwin-arm64-metal" : "darwin-x64-cpu";
  }
  if (platform === "win32") {
    if (b === "cuda") return `win32-${arch === "arm64" ? "arm64" : "x64"}-cuda`;
    if (b === "vulkan") return arch === "arm64" ? "win32-arm64-cpu" : "win32-x64-vulkan";
    return `win32-${arch === "arm64" ? "arm64" : "x64"}-cpu`;
  }
  if (platform === "linux") {
    const archPart = arch === "arm64" ? "arm64" : "x64";
    if (b === "cuda") return `linux-${archPart}-cuda`;
    if (b === "vulkan") return `linux-${archPart}-vulkan`;
    return `linux-${archPart}-cpu`;
  }
  return null;
}

export function assetUrl(asset) {
  return `${BASE}/${asset.name}`;
}
