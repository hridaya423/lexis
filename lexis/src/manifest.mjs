import fs from "node:fs/promises";
import path from "node:path";
import { manifestPath } from "./paths.mjs";

export async function loadManifest() {
  try {
    const raw = await fs.readFile(manifestPath(), "utf8");
    const parsed = JSON.parse(raw);
    return {
      files: Array.isArray(parsed?.files) ? parsed.files : [],
      dirs: Array.isArray(parsed?.dirs) ? parsed.dirs : [],
      rcFiles: Array.isArray(parsed?.rcFiles) ? parsed.rcFiles : [],
    };
  } catch {
    return { files: [], dirs: [], rcFiles: [] };
  }
}

export async function saveManifest(manifest) {
  const file = manifestPath();
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp-${process.pid}`;
  await fs.writeFile(tmp, JSON.stringify(manifest, null, 2) + "\n", "utf8");
  await fs.rename(tmp, file);
}

export async function recordManifestEntry(kind, entry) {
  const manifest = await loadManifest();
  const key = kind === "rcFiles" ? "rcFiles" : kind === "dirs" ? "dirs" : "files";
  const value = typeof entry === "string" ? entry : entry?.path;
  if (!value) {
    return manifest;
  }
  const exists = manifest[key].some((item) => (typeof item === "string" ? item : item?.path) === value);
  if (!exists) {
    manifest[key].push(entry);
  }
  await saveManifest(manifest);
  return manifest;
}
