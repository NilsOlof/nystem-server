import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import { readFile, lstat, readlink } from "node:fs/promises";
import { join } from "node:path";

const execute = promisify(execFile);
export const git = async (cwd, args, input) => {
  const process = execute("git", args, { cwd, maxBuffer: 8 * 1024 * 1024, timeout: 30000, env: { ...globalThis.process.env, GIT_TERMINAL_PROMPT: "0", GIT_LITERAL_PATHSPECS: "1" } });
  process.child.stdin.end(input);
  return (await process).stdout;
};
export const status = async (cwd) => {
  const entries = (await git(cwd, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])).split("\0");
  const files = [];
  for (let i = 0; i < entries.length; i++) {
    if (!entries[i]) continue;
    const code = entries[i].slice(0, 2);
    const path = entries[i].slice(3);
    const original = /[RC]/.test(code) ? entries[++i] : undefined;
    const conflict = code.includes("U") || ["AA", "DD"].includes(code);
    if (code[0] !== " " && code !== "??") files.push({ path, original, side: "staged", code: code[0], conflict });
    if (code[1] !== " " || code === "??") files.push({ path, original, side: "unstaged", code: code === "??" ? "?" : code[1], conflict });
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
};
export const parseDiff = (patch) => {
  const lines = patch.split("\n");
  const first = lines.findIndex((line) => line.startsWith("@@ "));
  const header = first < 0 ? patch : lines.slice(0, first).join("\n") + "\n";
  const hunks = [];
  let oldLine = 0;
  let newLine = 0;
  for (const line of first < 0 ? [] : lines.slice(first)) {
    if (line.startsWith("@@ ")) {
      const match = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(line);
      if (!match) continue;
      oldLine = Number(match[1]); newLine = Number(match[2]);
      hunks.push({ title: line, patch: line + "\n", lines: [] });
      continue;
    }
    const hunk = hunks.at(-1);
    if (!hunk || !/^[ +\-\\]/.test(line)) continue;
    hunk.patch += line + "\n";
    const kind = line[0] === "+" ? "added" : line[0] === "-" ? "removed" : line[0] === "\\" ? "note" : "context";
    hunk.lines.push({ text: kind === "note" ? line : line.slice(1), kind, old: kind === "added" || kind === "note" ? "" : oldLine++, new: kind === "removed" || kind === "note" ? "" : newLine++ });
  }
  return { header, hunks };
};
export const diff = async (cwd, file, whole = false) => {
  let patch;
  if (file.code === "?") {
    const absolute = join(cwd, file.path);
    const buffer = (await lstat(absolute)).isSymbolicLink() ? Buffer.from(await readlink(absolute)) : await readFile(absolute);
    if (buffer.length > 2 * 1024 * 1024) throw new Error("File is too large to preview");
    if (buffer.includes(0)) return { hunks: [], binary: true, token: createHash("sha256").update(buffer).digest("hex") };
    const text = buffer.toString("utf8");
    const lines = text ? text.replace(/\n$/, "").split("\n") : [];
    patch = `--- /dev/null\n+++ b/${file.path}\n` + (lines.length ? `@@ -0,0 +1,${lines.length} @@\n${lines.map((line) => "+" + line).join("\n")}\n${text.endsWith("\n") ? "" : "\\ No newline at end of file\n"}` : "");
  } else patch = await git(cwd, ["diff", ...(file.side === "staged" ? ["--cached"] : []), "--no-ext-diff", "--no-textconv", "--no-color", `--unified=${whole ? 1000000 : 3}`, "--", ...(file.original ? [file.original] : []), file.path]);
  return { ...parseDiff(patch), binary: patch.includes("Binary files "), token: createHash("sha256").update(patch).update(JSON.stringify(file)).digest("hex") };
};
