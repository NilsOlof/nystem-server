import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { summarizeStagedDiff } from "./commitDiff.js";

const execute = promisify(execFile);
test("Large staged diffs produce bounded samples and retain later files", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "nystem-commit-test-"));
  try {
    await execute("git", ["init"], { cwd });
    await writeFile(join(cwd, "a-large.txt"), "large staged text line\n".repeat(160000));
    await writeFile(join(cwd, "binary.bin"), Buffer.alloc(3 * 1024 * 1024, 0));
    await writeFile(join(cwd, "z-small.txt"), "small relevant change\n");
    await execute("git", ["add", "--", "."], { cwd });
    const { stdout: originalTree } = await execute("git", ["write-tree"], { cwd });
    const summary = await summarizeStagedDiff(cwd);
    assert.ok(summary.length < 251000);
    assert.match(summary, /Diff samples are truncated/);
    assert.match(summary, /small relevant change/);
    assert.match(summary, /Binary files/);
    assert.doesNotMatch(summary, /GIT binary patch/);
    // A change beyond the sampled portion must still invalidate the snapshot.
    await writeFile(join(cwd, "a-large.txt"), "large staged text line\n".repeat(160000) + "changed beyond sample\n");
    await execute("git", ["add", "--", "a-large.txt"], { cwd });
    const { stdout: currentTree } = await execute("git", ["write-tree"], { cwd });
    assert.notEqual(currentTree, originalTree);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});
