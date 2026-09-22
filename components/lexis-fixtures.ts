export const COUNT_SOURCE = `package main

import "fmt"

func main() {
    fmt.Println("Hello, world!")
}
`;

export const COUNT_LINES = COUNT_SOURCE.split("\n").slice(0, -1);

export type FixtureId = "clean" | "largest" | "find" | "count" | "size";

export interface Fixture {
  id: FixtureId;
  request: string;
  command: string;
  output: string[];
}

export const FIXTURES: Record<FixtureId, Fixture> = {
  clean: {
    id: "clean",
    request: "start my repo fresh",
    command: "rm -rf .git && git init",
    output: [
      "Initialized empty Git repository in ~/repo/.git/",
    ],
  },
  largest: {
    id: "largest",
    request: "show my largest files",
    command: "du -ah . | sort -rh | head -5",
    output: [
      "420M  ./example-video.mov",
      "168M  ./drafts/keynote.mov",
      "96M   ./node_modules",
      "12M   ./photos/trip.zip",
      "3.4M  ./notes.txt",
    ],
  },
  find: {
    id: "find",
    request: "find my Python files",
    command: 'find . -name "*.py"',
    output: ["src/app.py", "src/utils.py"],
  },
  count: {
    id: "count",
    request: "count lines in main.go",
    command: "wc -l main.go",
    output: [`${COUNT_LINES.length} main.go`],
  },
  size: {
    id: "size",
    request: "show this folder's size",
    command: "du -sh .",
    output: ["1.2G  ."],
  },
};

export const HERO_ALIASES: Record<string, FixtureId> = {
  "list all python files": "find",
  "show my largest files": "largest",
};

export function normalizeRequest(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function matchHeroRequest(value: string): FixtureId | null {
  const normalized = normalizeRequest(value);
  if (normalized === FIXTURES.clean.request) return "clean";
  return HERO_ALIASES[normalized] ?? null;
}
