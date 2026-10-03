import { join, resolve, sep } from "node:path";
import { git } from "./repository.js";

export default (app) => {
  const repositories = new Map();
  const release = (matches) => {
    for (const [cwd, repository] of repositories) {
      for (const [watchId, client] of repository.clients)
        if (matches(client, watchId)) repository.clients.delete(watchId);
      if (repository.clients.size) continue;
      repositories.delete(cwd);
      repository.closed = true;
      clearTimeout(repository.timer);
      repository.cancel?.(new Error("Git view closed"));
      repository.watcher?.close();
    }
  };
  app.connection.on("disconnect", (id) => release((client) => client.id === id));
  app.connection.on("logout", ({ id }) => release((client) => client.id === id));
  app.on("exit", () => release(() => true));

  return async (query, cwd) => {
    if (query.action === "unwatch") {
      release((client, watchId) => client.id === query.id && watchId === query.watchId);
      return;
    }
    let repository = repositories.get(cwd);
    if (!repository) {
      repository = { clients: new Map(), closed: false };
      repositories.set(cwd, repository);
      repository.ready = (async () => {
        const { watch } = await import(app.nodePath("chokidar"));
        const ignored = (
          await git(cwd, ["ls-files", "--others", "--ignored", "--exclude-standard", "--directory", "-z"])
        )
          .split("\0")
          .filter(Boolean)
          .map((path) => resolve(cwd, path));
        ignored.push(join(cwd, ".git"));
        const gitDir = (await git(cwd, ["rev-parse", "--absolute-git-dir"])).trim();
        const commonDir = resolve(cwd, (await git(cwd, ["rev-parse", "--git-common-dir"])).trim());
        const paths = [
          cwd,
          join(gitDir, "index"),
          join(gitDir, "HEAD"),
          join(commonDir, "refs"),
          join(commonDir, "packed-refs"),
          join(commonDir, "info", "exclude"),
        ];
        if (repository.closed) return;
        repository.watcher = watch(paths, {
          ignoreInitial: true,
          usePolling: false,
          awaitWriteFinish: false,
          followSymlinks: false,
          ignored: (path) => {
            path = resolve(path);
            if (
              paths
                .slice(1)
                .some((target) => path === target || path.startsWith(target + sep) || target.startsWith(path + sep))
            )
              return path.endsWith(".lock");
            return ignored.some((target) => path === target || path.startsWith(target + sep));
          },
        });
        repository.watcher.on("all", () => {
          clearTimeout(repository.timer);
          repository.timer = setTimeout(() => {
            for (const [watchId, { id, serverId }] of repository.clients)
              app.connection.emit({ type: "gitPageChanged", id, serverId, watchId });
          }, 200);
        });
        repository.watcher.on("error", (error) => {
          for (const [watchId, { id, serverId }] of repository.clients)
            app.connection.emit({ type: "gitPageChanged", id, serverId, watchId, error: error.message });
          release((client) => repository.clients.has(client.watchId));
        });
        await new Promise((resolve, reject) => {
          repository.cancel = reject;
          repository.watcher.once("ready", resolve);
          repository.watcher.once("error", reject);
        });
      })();
    }
    repository.clients.set(query.watchId, { id: query.id, serverId: query.serverId, watchId: query.watchId });
    try {
      await repository.ready;
    } catch (error) {
      release((client, watchId) => client.id === query.id && watchId === query.watchId);
      throw error;
    }
  };
};
