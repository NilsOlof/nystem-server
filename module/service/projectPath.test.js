import test from "node:test";
import assert from "node:assert/strict";
import { resolveProjectPath, findServerByPath } from "./projectPath.js";

const home = "/Users/test";
const oldPath = `${home}/Documents/nodejs/example`;
const newPath = `${home}/Dropbox/nodejs/example`;
const fsFor = (...paths) => ({
  existsSync: (path) => paths.includes(path),
  statSync: () => ({ isDirectory: () => true }),
  realpathSync: (path) => path,
});

test("prefers Dropbox even when the stale Documents directory still exists", () => {
  const fs = fsFor(oldPath, newPath);
  assert.equal(resolveProjectPath(fs, oldPath, home), newPath);
  const status = { _id: "one", basepath: newPath };
  assert.equal(findServerByPath(fs, [status], `${oldPath}/`, home), status);
  assert.equal(findServerByPath(fs, [status], newPath, home), status);
});

test("maps missing old paths and stale registered paths", () => {
  const fs = fsFor(newPath);
  const status = { _id: "one", basepath: oldPath };
  assert.equal(findServerByPath(fs, [status], oldPath, home), status);
  assert.equal(findServerByPath(fs, [status], newPath, home), status);
});

test("keeps exact unique matching and rejects ambiguous aliases", () => {
  const fs = fsFor(oldPath, newPath, `${newPath}-other`);
  assert.equal(findServerByPath(fs, [{ basepath: oldPath }, { basepath: newPath }], oldPath, home), false);
  assert.equal(findServerByPath(fs, [{ basepath: `${newPath}-other` }], oldPath, home), false);
  assert.equal(findServerByPath(fs, [], oldPath, home), false);
});

test("does not rewrite other roots or missing/non-directory destinations", () => {
  const fs = fsFor(oldPath);
  assert.equal(resolveProjectPath(fs, oldPath, home), oldPath);
  for (const path of ["/Users/other/Dropbox/nodejs/example", `${home}/Dropbox/nodejs-other/example`, newPath])
    assert.equal(resolveProjectPath(fsFor(path, newPath), path, home), path);
  assert.equal(
    resolveProjectPath({ ...fsFor(oldPath, newPath), statSync: () => ({ isDirectory: () => false }) }, oldPath, home),
    oldPath,
  );
});
