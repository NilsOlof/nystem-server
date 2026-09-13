import { homedir } from "node:os";
import { normalize, join, sep } from "node:path";

export const resolveProjectPath = (fs, projectPath, home = homedir()) => {
  if (!projectPath) return projectPath;
  const normalized = normalize(projectPath).replace(/\/+$/, "") || sep;
  const oldRoot = join(home, "Dropbox", "nodejs");
  if (normalized !== oldRoot && !normalized.startsWith(`${oldRoot}${sep}`))
    return normalized;
  const destination = join(home, "Documents", "nodejs", normalized.slice(oldRoot.length));
  return fs.existsSync(destination) && fs.statSync(destination).isDirectory()
    ? destination
    : normalized;
};

export const findServerByPath = (fs, statuses, projectPath, home = homedir()) => {
  const canonical = (value) => {
    if (!value) return undefined;
    const resolved = resolveProjectPath(fs, value, home);
    return fs.existsSync(resolved) ? fs.realpathSync(resolved) : undefined;
  };
  const requested = canonical(projectPath);
  if (!requested) return false;
  const matches = statuses.filter(({ basepath }) => canonical(basepath) === requested);
  return matches.length === 1 ? matches[0] : false;
};
