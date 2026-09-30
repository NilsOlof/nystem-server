import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import setup from "./index.js";
import { git, diff, status } from "./repository.js";

test("Git page: full context, file/hunk actions, stale requests and authorization", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "nystem-git-test-"));
  try {
    await git(cwd, ["init"]);
    const before = Array.from({ length: 60 }, (_, i) => `line ${i + 1}`).join("\n") + "\n";
    await writeFile(join(cwd, "file.txt"), before);
    await git(cwd, ["add", "--", "file.txt"]);
    await git(cwd, ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "Initial"]);
    const after = before.replace("line 10\n", "changed 10\n").replace("line 50\n", "changed 50\n");
    await writeFile(join(cwd, "file.txt"), after);
    let handler;
    setup({ on: (name, callback) => callback(), connection: { on: (name, callback) => { handler = callback; } }, session: { add: async (query) => { query.session = { role: query.testRole || "super" }; } }, database: { server: { get: async () => ({ data: { path: cwd } }) } }, event: async () => ({ basepath: cwd }) });
    const request = (query) => handler({ serverId: "test", ...query });
    let file = (await status(cwd))[0];
    let compact = await diff(cwd, file);
    let full = await diff(cwd, file, true);
    assert.equal(compact.hunks.length, 2);
    assert.equal(full.hunks.length, 1);
    assert.equal(full.hunks[0].lines[0].text, "line 1");
    assert.equal(full.hunks[0].lines.at(-1).text, "line 60");
    assert.equal((await request({ action: "status", testRole: "user" })).error, "Super-user access required");
    const stage = await request({ action: "stage", files: [{ ...file, token: full.token }], hunk: 0, compactToken: compact.token });
    assert.equal(stage.error, undefined);
    assert.equal(stage.files.length, 2);
    assert.match(await git(cwd, ["diff", "--cached"]), /changed 10/);
    assert.doesNotMatch(await git(cwd, ["diff", "--cached"]), /changed 50/);
    file = (await status(cwd)).find((file) => file.side === "staged");
    full = await diff(cwd, file, true); compact = await diff(cwd, file);
    assert.equal((await request({ action: "unstage", files: [{ ...file, token: full.token }], hunk: 0, compactToken: compact.token })).error, undefined);
    file = (await status(cwd))[0]; full = await diff(cwd, file, true); compact = await diff(cwd, file);
    assert.equal((await request({ action: "discard", files: [{ ...file, token: full.token }], hunk: 1, compactToken: compact.token })).error, undefined);
    assert.match(await readFile(join(cwd, "file.txt"), "utf8"), /line 50\n/);
    file = (await status(cwd))[0]; full = await diff(cwd, file, true);
    await writeFile(join(cwd, "file.txt"), after + "new line\n");
    assert.match((await request({ action: "stage", files: [{ ...file, token: full.token }] })).error, /file changed/);
    full = await diff(cwd, file, true);
    assert.equal((await request({ action: "stage", files: [{ ...file, token: full.token }] })).error, undefined);
    await writeFile(join(cwd, "new file.txt"), "new\n");
    file = (await status(cwd)).find((file) => file.code === "?"); full = await diff(cwd, file, true);
    assert.equal(full.hunks[0].lines[0].kind, "added");
    assert.equal((await request({ action: "stage", files: [{ ...file, token: full.token }] })).error, undefined);
    assert.equal((await request({ action: "diff", path: "../outside", side: "unstaged" })).diff, undefined);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});

test("Git page supports unborn staging, renames, and binary previews", async () => {
  const cwd = await mkdtemp(join(tmpdir(), "nystem-git-test-"));
  try {
    await git(cwd, ["init"]);
    let handler;
    setup({ on: (name, callback) => callback(), connection: { on: (name, callback) => { handler = callback; } }, session: { add: async (query) => { query.session = { role: "super" }; } }, database: { server: { get: async () => ({ data: { path: cwd } }) } }, event: async () => ({ basepath: cwd }) });
    await writeFile(join(cwd, "before.txt"), "unchanged content\n");
    let file = (await status(cwd))[0];
    let full = await diff(cwd, file, true);
    assert.equal((await handler({ serverId: "test", action: "stage", files: [{ ...file, token: full.token }] })).error, undefined);
    file = (await status(cwd))[0]; full = await diff(cwd, file, true);
    assert.equal((await handler({ serverId: "test", action: "unstage", files: [{ ...file, token: full.token }] })).error, undefined);
    assert.equal((await status(cwd))[0].code, "?");
    await git(cwd, ["add", "--", "before.txt"]);
    await git(cwd, ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "commit", "-m", "Initial"]);
    await git(cwd, ["mv", "before.txt", "after.txt"]);
    file = (await status(cwd))[0];
    assert.equal(file.original, "before.txt");
    assert.equal(file.path, "after.txt");
    await writeFile(join(cwd, "binary.bin"), Buffer.from([0, 1, 2]));
    file = (await status(cwd)).find((file) => file.code === "?");
    assert.equal((await diff(cwd, file)).binary, true);
  } finally { await rm(cwd, { recursive: true, force: true }); }
});
