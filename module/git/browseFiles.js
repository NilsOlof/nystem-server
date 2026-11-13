import { lstat, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, sep } from "node:path";
import { editFile } from "./repository.js";

export const browseFiles = async (app, cwd, { action, path, value, token }) => {
  const parts = typeof path === "string" ? (path === "" ? [] : path.split("/")) : [""];
  if (parts.some((part) => !part || part === "." || part === ".." || /[\\:\0]/.test(part)))
    throw new Error("Choose a path inside the project");

  const root = await realpath(cwd);
  const target = await realpath(join(root, ...parts));
  const resolved = relative(root, target);
  if (isAbsolute(resolved) || resolved === ".." || resolved.startsWith(`..${sep}`))
    throw new Error("Choose a path inside the project");

  if (action === "folderSize") {
    if (!(await lstat(target)).isDirectory()) throw new Error("Select a folder");
    const pending = [target];
    const deadline = Date.now() + 5 * 60 * 1000;
    let size = 0;
    while (pending.length) {
      const folder = pending.pop();
      for (const name of await readdir(folder)) {
        if (Date.now() > deadline) throw new Error("Folder size calculation timed out");
        const entry = join(folder, name);
        const info = await lstat(entry);
        if (info.isDirectory()) pending.push(entry);
        else if (info.isFile()) size += info.size;
      }
    }
    return { size };
  }

  if (action !== "browseFiles") {
    if (resolved.split(sep).includes(".git")) throw new Error("Git metadata is unavailable in the editor");
    if (!(await lstat(join(root, ...parts))).isFile()) throw new Error("Select a regular file");
    const editAction = {
      previewFile: "read",
      saveBrowserFile: "save",
      formatBrowserFile: "format",
      deleteBrowserFile: "delete",
    }[action];
    const file = { path: resolved };
    const edit = await editFile(app, root, file, { action: editAction, value, token });
    return { edit: editAction === "save" ? await editFile(app, root, file, { action: "read" }) : edit };
  }

  const entries = await readdir(target);
  const items = await Promise.all(
    entries.map(async (name) => {
      const info = await lstat(join(target, name)).catch((error) => {
        if (error.code !== "ENOENT") throw error;
      });
      if (!info) return null;
      return { name, directory: info.isDirectory(), file: info.isFile(), size: info.size, modified: info.mtimeMs };
    }),
  );
  return {
    items: items
      .filter(Boolean)
      .sort((a, b) => Number(b.directory) - Number(a.directory) || a.name.localeCompare(b.name)),
  };
};
