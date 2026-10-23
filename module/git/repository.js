import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createHash, randomUUID } from "node:crypto";
import { readFile, lstat, readlink, realpath, writeFile, rename, rm } from "node:fs/promises";
import { join, relative, sep, isAbsolute } from "node:path";

const execute = promisify(execFile);
export const editFile = async (app, cwd, file, query) => {
  const absolute = join(cwd, file.path);
  const resolved = relative(await realpath(cwd), await realpath(absolute));
  if (
    isAbsolute(resolved) ||
    resolved === ".." ||
    resolved.startsWith(`..${sep}`) ||
    resolved.split(sep).includes(".git")
  )
    throw new Error("The file must be inside the repository");
  const info = await lstat(absolute);
  if (!info.isFile()) throw new Error("Only regular text files can be edited");
  if (info.size > 2 * 1024 * 1024) throw new Error("File is too large to edit");
  const buffer = await readFile(absolute);
  const value = buffer.toString("utf8");
  if (buffer.includes(0) || !Buffer.from(value).equals(buffer)) throw new Error("Only UTF-8 text files can be edited");
  const token = createHash("sha256").update(buffer).digest("hex");
  if (query.action === "read") return { value, token };
  if (token !== query.token) throw new Error("The file changed on disk. Cancel and reopen it before saving");
  if (typeof query.value !== "string" || Buffer.byteLength(query.value) > 2 * 1024 * 1024)
    throw new Error("File must be text smaller than 2 MB");
  const prettier = await import(app.nodePath("prettier"));
  const options = await prettier.resolveConfig(absolute, { editorconfig: true, useCache: false });
  const { ignored, inferredParser } = await prettier.getFileInfo(absolute, {
    ignorePath: join(cwd, ".prettierignore"),
    plugins: options?.plugins,
  });
  const formatted =
    !ignored && (inferredParser || options?.parser)
      ? await prettier.format(query.value, { ...options, filepath: absolute })
      : query.value;
  if (
    createHash("sha256")
      .update(await readFile(absolute))
      .digest("hex") !== token
  )
    throw new Error("The file changed on disk. Cancel and reopen it before saving");
  const temporary = `${absolute}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, formatted, { flag: "wx", mode: info.mode });
    await rename(temporary, absolute);
  } finally {
    await rm(temporary, { force: true });
  }
};

export const git = async (cwd, args, input) => {
  const process = execute("git", args, {
    cwd,
    maxBuffer: 8 * 1024 * 1024,
    timeout: 30000,
    env: { ...globalThis.process.env, GIT_TERMINAL_PROMPT: "0", GIT_LITERAL_PATHSPECS: "1", GIT_OPTIONAL_LOCKS: "0" },
  });
  process.child.stdin.end(input);
  return (await process).stdout;
};
export const history = async (cwd) =>
  (await git(cwd, ["log", "--all", "--topo-order", "--max-count=200", "--format=%H%x00%P%x00%D%x00%s%x00%an%x00%at"]))
    .trimEnd()
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, parents, refs, subject, author, date] = line.split("\0");
      return {
        hash,
        parents: parents ? parents.split(" ") : [],
        refs: refs ? refs.split(", ") : [],
        subject,
        author,
        date: Number(date) * 1000,
      };
    });

export const status = async (cwd) => {
  const entries = (await git(cwd, ["status", "--porcelain=v1", "-z", "--untracked-files=all"])).split("\0");
  const files = [];
  for (let i = 0; i < entries.length; i++) {
    if (!entries[i]) continue;
    const code = entries[i].slice(0, 2);
    const path = entries[i].slice(3);
    const original = /[RC]/.test(code) ? entries[++i] : undefined;
    const conflict = code.includes("U") || ["AA", "DD"].includes(code);
    if (code[0] !== " " && code !== "??")
      files.push({
        path,
        original: /[RC]/.test(code[0]) ? original : undefined,
        side: "staged",
        code: code[0],
        conflict,
      });
    if (code[1] !== " " || code === "??")
      files.push({
        path,
        original: /[RC]/.test(code[1]) ? original : undefined,
        side: "unstaged",
        code: code === "??" ? "?" : code[1],
        conflict,
      });
  }
  return files.sort((a, b) => a.path.localeCompare(b.path));
};
export const historyCommit = async (cwd, hash) => {
  if (!/^[a-f0-9]{40,64}$/.test(hash)) throw new Error("Choose a commit");
  const [parents, author, email, date, ...message] = (
    await git(cwd, ["show", "-s", "--format=%P%x00%an%x00%ae%x00%at%x00%B", hash])
  ).split("\0");
  const entries = (
    await git(cwd, [
      ...(parents ? ["diff"] : ["diff-tree", "--root", "--no-commit-id", "-r"]),
      "-M",
      "--name-status",
      "-z",
      ...(parents ? [parents.split(" ")[0], hash] : [hash]),
    ])
  ).split("\0");
  const files = [];
  for (let i = 0; i < entries.length && entries[i]; i++) {
    const code = entries[i][0];
    const original = ["R", "C"].includes(code) ? entries[++i] : undefined;
    files.push({ code, original, path: entries[++i], side: "history" });
  }
  return {
    hash,
    parents: parents ? parents.split(" ") : [],
    author,
    email,
    date: Number(date) * 1000,
    message: message.join("\0").trimEnd(),
    files: files.sort((a, b) => a.path.localeCompare(b.path)),
  };
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
      oldLine = Number(match[1]);
      newLine = Number(match[2]);
      hunks.push({ title: line, patch: line + "\n", lines: [] });
      continue;
    }
    const hunk = hunks.at(-1);
    if (!hunk || !/^[ +\-\\]/.test(line)) continue;
    hunk.patch += line + "\n";
    const kind = line[0] === "+" ? "added" : line[0] === "-" ? "removed" : line[0] === "\\" ? "note" : "context";
    hunk.lines.push({
      text: kind === "note" ? line : line.slice(1),
      kind,
      old: kind === "added" || kind === "note" ? "" : oldLine++,
      new: kind === "removed" || kind === "note" ? "" : newLine++,
    });
  }
  return { header, hunks };
};
export const diff = async (cwd, file, whole = false, commit) => {
  let patch;
  if (file.code === "?") {
    const absolute = join(cwd, file.path);
    const buffer = (await lstat(absolute)).isSymbolicLink()
      ? Buffer.from(await readlink(absolute))
      : await readFile(absolute);
    if (buffer.length > 2 * 1024 * 1024) throw new Error("File is too large to preview");
    if (buffer.includes(0))
      return { hunks: [], binary: true, token: createHash("sha256").update(buffer).digest("hex") };
    const text = buffer.toString("utf8");
    const lines = text ? text.replace(/\n$/, "").split("\n") : [];
    patch =
      `--- /dev/null\n+++ b/${file.path}\n` +
      (lines.length
        ? `@@ -0,0 +1,${lines.length} @@\n${lines.map((line) => "+" + line).join("\n")}\n${text.endsWith("\n") ? "" : "\\ No newline at end of file\n"}`
        : "");
  } else
    patch = await git(cwd, [
      ...(commit && !commit.parents.length ? ["diff-tree", "--root", "--no-commit-id", "-r", "-p"] : ["diff"]),
      ...(commit ? ["-M"] : []),
      ...(file.side === "staged" ? ["--cached"] : []),
      "--no-ext-diff",
      "--no-textconv",
      "--no-color",
      `--unified=${whole ? 1000000 : 3}`,
      ...(commit ? [...commit.parents.slice(0, 1), commit.hash] : []),
      "--",
      ...(file.original ? [file.original] : []),
      file.path,
    ]);
  return {
    ...parseDiff(patch),
    binary: patch.includes("Binary files "),
    token: createHash("sha256").update(patch).update(JSON.stringify(file)).digest("hex"),
  };
};
