import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import app from "nystem";
import { ContentTypeRender, Wrapper } from "nystem-components";
import { GitContext } from "../../client/context";

const GitView = ({ model, view, path }) => {
  const [files, setFiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [whole, setWhole] = useState(false);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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
      const response = await app.connection.emit({ type: "gitPage", serverId: view.id, ...query });
      if (response.error) throw new Error(response.error);
      return response;
    },
    [view.id],
  );
  const refresh = useCallback(async () => {
    setBusy(true);
    setError("");
    try {
      const { files } = await request({ action: "status" });
      setFiles(files);
      setSelected(
        (previous) =>
          files.find((file) => file.path === previous?.path && file.side === previous.side) || files[0] || null,
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
    }
  }, [request]);
  useEffect(() => {
    restoreFocus.current = true;
    previewFile.current = null;
    setPreview(null);
    setSelected(null);
    refresh();
  }, [refresh]);
  useEffect(() => {
    const current = ++generation.current;
    if (selected?.path !== previewFile.current?.path || selected?.side !== previewFile.current?.side) setPreview(null);
    previewFile.current = selected;
    if (!selected) return;
    setBusy(true);
    request({ action: "diff", ...selected })
      .then(async (compact) => {
        const full = await request({ action: "diff", ...selected, whole: true });
        if (generation.current === current) setPreview({ compact: compact.diff, full: full.diff });
      })
      .catch((error) => {
        if (generation.current === current) setError(error.message);
      })
      .finally(() => {
        if (generation.current === current) setBusy(false);
      });
    return () => {
      generation.current++;
    };
  }, [selected, request]);
  const act = async (action, targets, hunk) => {
    if (busy) return;
    if (
      action === "discard" &&
      !window.confirm(hunk === undefined ? "Discard the unstaged changes in this file?" : "Discard this hunk?")
    )
      return;
    const focused =
      element.current.contains(document.activeElement) && document.activeElement.matches("button[data-git-file]")
        ? { path: document.activeElement.dataset.gitPath, side: document.activeElement.dataset.gitSide }
        : null;
    const index = focused
      ? files
          .filter((file) => file.side === focused.side && file.path.toLowerCase().includes(search.toLowerCase()))
          .findIndex((file) => file.path === focused.path)
      : -1;
    setBusy(true);
    setError("");
    try {
      const validated = [];
      for (const file of targets) {
        const full =
          file === selected && preview ? preview.full : (await request({ action: "diff", ...file, whole: true })).diff;
        validated.push({ path: file.path, side: file.side, token: full.token });
      }
      const { files } = await request({ action, files: validated, hunk, compactToken: preview?.compact.token });
      restoreFocus.current = Boolean(focused);
      setFiles(files);
      if (focused) {
        const remaining = files.filter(
          (file) => file.side === focused.side && file.path.toLowerCase().includes(search.toLowerCase()),
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
      setBusy(false);
    }
  };
  return (
    <GitContext.Provider
      value={{ files, selected, setSelected, preview, whole, setWhole, search, setSearch, busy, error, refresh, act }}
    >
      <Wrapper ref={element} className={model.className}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    </GitContext.Provider>
  );
};
export default GitView;
