import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

// Sample each file without buffering the complete diff or binary patch data.
export const summarizeStagedDiff = (cwd) => new Promise((resolve, reject) => {
  const child = spawn("git", ["diff", "--cached", "--no-ext-diff", "--no-textconv", "--no-color", "--unified=3"], { cwd });
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  let sample = "";
  let fileSize = 0;
  let omitted = false;
  let stderr = "";
  lines.on("line", (line) => {
    if (line.startsWith("diff --git ")) fileSize = 0;
    const available = Math.min(8000 - fileSize, 250000 - sample.length);
    if (available <= 0) { omitted = true; return; }
    const part = `${line}\n`.slice(0, available);
    sample += part;
    fileSize += part.length;
    if (part.length < line.length + 1) omitted = true;
  });
  child.stderr.on("data", (chunk) => { stderr = (stderr + chunk.toString()).slice(-4000); });
  child.on("error", reject);
  child.on("close", (code) => {
    if (code !== 0) reject(new Error(stderr || `Git diff exited: ${code}`));
    else resolve(`${omitted ? "Diff samples are truncated; use the staged file list to understand scope.\n\n" : ""}${sample}`);
  });
});
