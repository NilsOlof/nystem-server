import { realpath, unlink } from "node:fs/promises";
import { dirname, join } from "node:path";
import { git, status, diff, editFile, history, historyCommit } from "./repository.js";
import watch from "./watch.js";

export default (app) => {
  const busy = new Map();
  app.on("start", () => {
    const subscribe = watch(app);
    app.connection.on("gitPage", async (query) => {
      const reply = { ...query };
      try {
        await app.session.add(query);
        if (query.session?.role !== "super") throw new Error("Super-user access required");
        if (query.action === "unwatch") {
          await subscribe(query);
          delete reply.session;
          return reply;
        }
        const { data: server } = await app.database.server.get({ id: query.serverId, role: "super" });
        if (!server) throw new Error("Server was not found");
        const { basepath } = await app.event("serverPath", server);
        let sourcePath = basepath;
        try {
          sourcePath = dirname(await realpath(join(basepath, ".git")));
        } catch {
          /* Git resolves worktrees and repositories without a .git directory. */
        }
        const cwd = (await git(sourcePath, ["rev-parse", "--show-toplevel"])).trim();
        if (query.action === "watch") {
          await subscribe(query, cwd);
          delete reply.session;
          return reply;
        }
        const previous = busy.get(cwd);
        let done;
        const current = new Promise((resolve) => {
          done = resolve;
        });
        busy.set(cwd, current);
        await previous;
        try {
          if (query.action === "history") {
            reply.commits = await history(cwd);
            delete reply.session;
            delete reply.value;
            return reply;
          }
          if (["historyCommit", "historyDiff"].includes(query.action)) {
            const commit = await historyCommit(cwd, query.hash);
            if (query.action === "historyCommit") reply.commit = commit;
            else {
              const file = commit.files.find((file) => file.path === query.path);
              if (!file) throw new Error("The file is not part of this commit");
              reply.diff = await diff(cwd, file, Boolean(query.whole), commit);
            }
            delete reply.session;
            delete reply.value;
            return reply;
          }
          const files = await status(cwd);
          if (["status", "switch"].includes(query.action)) {
            reply.branches = (await git(cwd, ["for-each-ref", "--format=%(refname:short)", "refs/heads"]))
              .trim()
              .split("\n")
              .filter(Boolean);
            if (query.action === "switch") {
              if (!["master", "develop", "stage"].includes(query.branch) || !reply.branches.includes(query.branch))
                throw new Error("The branch is unavailable; refresh the Git panel");
              await git(cwd, ["switch", "--no-guess", query.branch]);
            }
            reply.branch = (await git(cwd, ["branch", "--show-current"])).trim();
            reply.files = query.action === "switch" ? await status(cwd) : files;
          } else {
            const requested = ["diff", "read", "save"].includes(query.action)
              ? [{ path: query.path, side: query.side }]
              : query.files;
            if (!Array.isArray(requested) || !requested.length) throw new Error("Choose a file");
            const byPath = new Map(files.map((file) => [`${file.side}:${file.path}`, file]));
            const selected = requested.map((item) => {
              const file = byPath.get(`${item.side}:${item.path}`);
              if (!file) throw new Error("Changes have moved; refresh the file list");
              return file;
            });
            if (query.action === "diff") reply.diff = await diff(cwd, selected[0], Boolean(query.whole));
            else if (["read", "save"].includes(query.action)) {
              reply.edit = await editFile(app, cwd, selected[0], query);
              if (query.action === "save") reply.files = await status(cwd);
            } else {
              if (!["stage", "unstage", "discard"].includes(query.action)) throw new Error("Unknown Git action");
              for (let i = 0; i < selected.length; i++) {
                if (selected[i].conflict) throw new Error("Resolve merge conflicts before changing staging here");
                if (
                  (selected.length === 1 || query.hunk !== undefined || query.action === "discard") &&
                  (await diff(cwd, selected[i], true)).token !== requested[i].token
                )
                  throw new Error("The file changed; refresh before applying this action");
                if (selected[i].side !== (query.action === "unstage" ? "staged" : "unstaged"))
                  throw new Error("Invalid staging action");
              }
              if (query.hunk !== undefined) {
                if (selected.length !== 1 || selected[0].code === "?" || selected[0].original)
                  throw new Error("Use the file action for new or renamed files");
                const compact = await diff(cwd, selected[0]);
                const hunk = compact.hunks[query.hunk];
                if (!Number.isInteger(query.hunk) || !hunk || compact.token !== query.compactToken)
                  throw new Error("The hunk changed; refresh before applying this action");
                await git(
                  cwd,
                  [
                    "apply",
                    ...(query.action === "discard"
                      ? ["--reverse"]
                      : ["--cached", ...(query.action === "unstage" ? ["--reverse"] : [])]),
                    "--recount",
                    "--whitespace=nowarn",
                    "-",
                  ],
                  compact.header + hunk.patch,
                );
              } else {
                const paths = [...new Set(selected.flatMap((file) => [file.original, file.path].filter(Boolean)))];
                if (query.action === "stage") await git(cwd, ["add", "--", ...paths]);
                if (query.action === "unstage") {
                  let hasHead = true;
                  try {
                    await git(cwd, ["rev-parse", "--verify", "HEAD"]);
                  } catch {
                    hasHead = false;
                  }
                  await git(
                    cwd,
                    hasHead ? ["restore", "--staged", "--", ...paths] : ["rm", "--cached", "--", ...paths],
                  );
                }
                if (query.action === "discard") {
                  if (selected.some((file) => file.original))
                    throw new Error("Discard is unavailable for renamed files");
                  for (const file of selected)
                    if (file.code === "?") await unlink(join(cwd, file.path));
                    else await git(cwd, ["restore", "--worktree", "--", file.path]);
                }
              }
              reply.files = await status(cwd);
            }
          }
        } finally {
          done();
          if (busy.get(cwd) === current) busy.delete(cwd);
        }
      } catch (error) {
        reply.error = error.message;
      }
      delete reply.session;
      delete reply.value;
      return reply;
    });
  });
};
