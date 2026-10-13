import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import app from "nystem";
import { ContentTypeRender, Wrapper } from "nystem-components";
import GitHistory from "./history";
import { GitContext } from "../../client/context";

const GitView = ({ model, view, path }) => {
  const [taskLog, setTaskLog] = useState({ open: false, action: "" });
  const showTaskLog = useCallback(
    (open, action) => {
      setTaskLog({ open, action });
      if (open) setHistoryOpen(false);
      else app.connection.emit({ type: "serverTaskClear", serverId: view.id, action });
    },
    [view.id],
  );
  const [history, setHistory] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historySelected, setHistorySelected] = useState(null);
  const [files, setFiles] = useState([]);
  const [branch, setBranch] = useState("");
  const [branches, setBranches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [edit, setEdit] = useState(null);
  const [whole, setWhole] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [refreshPending, setRefreshPending] = useState(false);
  const activity = useRef(0);
  const requests = useRef(Promise.resolve());
  const generation = useRef(0);
  const element = useRef(null);
  const restoreFocus = useRef(true);
  const previewFile = useRef(null);

  useLayoutEffect(() => {
    if (!restoreFocus.current || !selected) return;
    restoreFocus.current = false;
    Array.from(element.current.querySelectorAll("button[data-git-file]"))
      .find((button) => button.dataset.gitPath === selected?.path && button.dataset.gitSide === selected.side)
      ?.focus({ preventScroll: true });
  }, [files, selected]);
  const request = useCallback(
    async (query) => {
      const response = await (requests.current = requests.current
        .catch(() => {})
        .then(async () => {
          if (!app.connection.connected) throw new Error("Connection closed");
          let disconnected;
          const closed = new Promise((resolve, reject) => {
            disconnected = ({ connected }) => {
              if (connected === false) reject(new Error("Connection closed"));
            };
            app.connection.on("connection", disconnected);
          });
          try {
            return await Promise.race([app.connection.emit({ type: "gitPage", serverId: view.id, ...query }), closed]);
          } finally {
            app.connection.off("connection", disconnected);
          }
        }));
      if (response.error) throw new Error(response.error);
      return response;
    },
    [view.id],
  );
  const finish = useCallback(() => {
    activity.current--;
    setBusy(activity.current > 0);
  }, []);
  const refresh = useCallback(async () => {
    if (activity.current) {
      setRefreshPending(true);
      return;
    }
    activity.current++;
    setBusy(true);
    setError("");
    try {
      const { files, branch, branches } = await request({ action: "status" });
      setFiles(files);
      setBranch(branch);
      setBranches(branches || []);
      setSelected(
        (previous) =>
          files.find((file) => file.path === previous?.path && file.side === previous.side) ||
          files.find((file) => file.path === previous?.path) ||
          files.find((file) => file.side === "unstaged") ||
          files[0] ||
          null,
      );
    } catch (error) {
      setError(error.message);
    } finally {
      finish();
    }
  }, [request, finish]);
  useEffect(() => {
    restoreFocus.current = true;
    previewFile.current = null;
    setPreview(null);
    setEdit(null);
    setSelected(null);
    refresh();
    const watchId = app.uuid();
    let active = true;
    const changed = (query) => {
      if (query.watchId !== watchId) return;
      if (query.error) setError(query.error);
      else setRefreshPending(true);
    };
    const subscribe = async ({ connected = true } = {}) => {
      if (!connected) return;
      try {
        await request({ action: "watch", watchId });
        if (active) setRefreshPending(true);
        else await request({ action: "unwatch", watchId });
      } catch (error) {
        if (active) {
          setError(error.message);
        }
      }
    };
    app.connection.on("gitPageChanged", changed);
    app.connection.on("connection", subscribe);
    subscribe();
    return () => {
      active = false;
      app.connection.off("gitPageChanged", changed);
      app.connection.off("connection", subscribe);
      request({ action: "unwatch", watchId }).catch(() => {});
    };
  }, [request, refresh]);
  useEffect(() => {
    const current = ++generation.current;
    if (selected?.path !== previewFile.current?.path || selected?.side !== previewFile.current?.side) setPreview(null);
    previewFile.current = selected;
    if (!selected) return;
    activity.current++;
    setBusy(true);
    request({ action: "diff", ...selected })
      .then(async (compact) => {
        const full = await request({ action: "diff", ...selected, whole: true });
        if (generation.current === current)
          setPreview((previous) =>
            previous?.path === selected.path &&
            previous.side === selected.side &&
            previous.compact.token === compact.diff.token &&
            previous.full.token === full.diff.token
              ? previous
              : { path: selected.path, side: selected.side, compact: compact.diff, full: full.diff },
          );
      })
      .catch((error) => {
        if (generation.current === current) setError(error.message);
      })
      .finally(() => {
        finish();
      });
    return () => {
      generation.current++;
    };
  }, [selected, request, finish]);
  useEffect(() => {
    if (!refreshPending || activity.current || edit) return;
    setRefreshPending(false);
    refresh();
  }, [refreshPending, busy, edit, refresh]);
  const openHistory = async () => {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }
    if (activity.current || edit) return;
    setHistoryOpen(true);
    setHistory(null);
    activity.current++;
    setBusy(true);
    setError("");
    try {
      const { commits } = await request({ action: "history" });
      setHistory(commits);
      setHistorySelected(commits[0]?.hash || null);
    } catch (error) {
      setError(error.message);
    } finally {
      finish();
    }
  };
  const switchBranch = async (branch) => {
    if (activity.current || edit) return;
    activity.current++;
    setBusy(true);
    setError("");
    try {
      const response = await request({ action: "switch", branch });
      generation.current++;
      previewFile.current = null;
      setPreview(null);
      setBranch(response.branch);
      setBranches(response.branches);
      setFiles(response.files);
      setSelected(response.files[0] || null);
      if (historyOpen) setHistory((await request({ action: "history" })).commits);
    } catch (error) {
      setError(error.message);
    } finally {
      finish();
    }
  };
  const editFile = async (action) => {
    if (activity.current) return;
    activity.current++;
    setBusy(true);
    setError("");
    try {
      if (action === "read") {
        setEdit({ path: selected.path, side: selected.side, value: "" });
        const { edit } = await request({ action, ...selected });
        setEdit({ ...edit, path: selected.path, side: selected.side });
      } else {
        await request({ action, ...edit });
        setEdit(null);
        setRefreshPending(true);
      }
    } catch (error) {
      if (action === "read") setEdit(null);
      setError(error.message);
    } finally {
      finish();
    }
  };
  const act = async (action, targets, hunk) => {
    if (activity.current) return;
    if (
      action === "discard" &&
      !window.confirm(hunk === undefined ? "Discard the unstaged changes in this file?" : "Discard this hunk?")
    )
      return;
    const focused =
      element.current.contains(document.activeElement) && document.activeElement.matches("[data-git-file]")
        ? { path: document.activeElement.dataset.gitPath, side: document.activeElement.dataset.gitSide }
        : null;
    const index = focused
      ? files
          .filter(
            (file) =>
              file.side === focused.side &&
              `${file.original || ""} ${file.path}`.toLowerCase().includes(search.toLowerCase()),
          )
          .findIndex((file) => file.path === focused.path)
      : -1;
    activity.current++;
    setBusy(true);
    setError("");
    try {
      const validated = targets.map(({ path, side }) => ({ path, side }));
      // Bulk whole-file staging uses the current contents, like Git add/restore.
      if (targets.length === 1 || hunk !== undefined || action === "discard")
        for (let i = 0; i < targets.length; i++) {
          const full =
            targets[i] === selected && preview
              ? preview.full
              : (await request({ action: "diff", ...targets[i], whole: true })).diff;
          validated[i].token = full.token;
        }
      const { files } = await request({ action, files: validated, hunk, compactToken: preview?.compact.token });
      restoreFocus.current = Boolean(focused);
      setFiles(files);
      if (focused) {
        const remaining = files.filter(
          (file) =>
            file.side === focused.side &&
            `${file.original || ""} ${file.path}`.toLowerCase().includes(search.toLowerCase()),
        );
        setSelected(
          remaining[Math.min(index, remaining.length - 1)] ||
            files.find((file) => file.path === focused.path) ||
            files[0] ||
            null,
        );
      } else
        setSelected(
          files.find((file) => file.path === selected?.path && file.side === selected.side) || files[0] || null,
        );
    } catch (error) {
      setError(error.message);
    } finally {
      finish();
    }
  };
  return (
    <GitContext.Provider
      value={{
        taskLog: { ...taskLog, open: taskLog.open && !historyOpen },
        showTaskLog,
        openHistory,
        historyOpen,
        files,
        branch,
        branches,
        switchBranch,
        selected,
        setSelected: (selected) => {
          if (!edit) setSelected(selected);
        },
        preview: selected && selected.path === preview?.path && selected.side === preview.side ? preview : null,
        whole,
        setWhole,
        search,
        setSearch,
        busy,
        edit,
        setEdit,
        editFile,
        error,
        refresh,
        act,
      }}
    >
      <Wrapper ref={element} className={[model.className, "git-workspace"]}>
        <ContentTypeRender path={path} items={model.item.slice(0, 1)} />
        {historyOpen ? (
          <GitHistory
            request={request}
            view={view}
            error={error}
            history={history}
            historySelected={historySelected}
            setHistorySelected={setHistorySelected}
          />
        ) : (
          <ContentTypeRender path={path} items={model.item.slice(1)} />
        )}
      </Wrapper>
    </GitContext.Provider>
  );
};
export default GitView;
