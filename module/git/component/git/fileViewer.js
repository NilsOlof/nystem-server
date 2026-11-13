import { useEffect, useState } from "react";
import { Button, Icon } from "nystem-components";
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/jsx/jsx";
import "codemirror/mode/css/css";
import "codemirror/mode/htmlmixed/htmlmixed";
import "codemirror/mode/markdown/markdown";
import "codemirror/mode/yaml/yaml";
import "codemirror/mode/shell/shell";
import "codemirror/mode/python/python";
import "codemirror/mode/sql/sql";
import "codemirror/theme/monokai.css";

const modes = {
  js: "text/jsx",
  jsx: "text/jsx",
  mjs: "text/javascript",
  cjs: "text/javascript",
  ts: "application/typescript",
  tsx: "text/typescript-jsx",
  json: "application/json",
  css: "text/css",
  html: "text/html",
  xml: "application/xml",
  svg: "application/xml",
  md: "text/x-markdown",
  yaml: "text/x-yaml",
  yml: "text/x-yaml",
  sh: "text/x-sh",
  py: "text/x-python",
  sql: "text/x-sql",
};

const GitFileViewer = ({ file, request, close, changed, setViewerBusy, setDirty }) => {
  const [saved, setSaved] = useState(null);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const dirty = Boolean(saved && value !== saved.value);

  useEffect(() => {
    setDirty(dirty);
    return () => setDirty(false);
  }, [dirty, setDirty]);

  useEffect(() => {
    let active = true;
    request({ action: "previewFile", path: file })
      .then(({ edit }) => {
        if (!active) return;
        setSaved(edit);
        setValue(edit.value);
      })
      .catch((error) => active && setError(error.message))
      .finally(() => active && setBusy(false));
    return () => {
      active = false;
    };
  }, [file, request]);

  const run = async (action) => {
    if (busy) return;
    setBusy(true);
    setViewerBusy(true);
    setError("");
    try {
      const { edit } = await request({ action, path: file, value, token: saved?.token });
      if (action === "deleteBrowserFile") close();
      else {
        setValue(edit.value);
        if (action !== "formatBrowserFile") setSaved(edit);
      }
      if (action === "saveBrowserFile" || action === "deleteBrowserFile") changed();
    } catch (error) {
      setError(error.message);
    } finally {
      setBusy(false);
      setViewerBusy(false);
    }
  };

  return (
    <section aria-label="File editor" className="flex min-h-0 min-w-0 flex-col overflow-auto border-l border-gray-700">
      <div className="flex flex-wrap items-center gap-2 bg-gray-800 px-3 py-2">
        <span title={file} className="min-w-0 truncate font-semibold">
          {file.split("/").at(-1)}
        </span>
        <Button
          size="xs"
          type="primary"
          disabled={busy || !saved || value === saved.value}
          onClick={() => run("saveBrowserFile")}
        >
          Save
        </Button>
        <Button
          size="xs"
          disabled={busy || !saved || value === saved.value}
          onClick={() => {
            setValue(saved.value);
            setError("");
          }}
        >
          Cancel
        </Button>
        <Button
          size="xs"
          disabled={busy}
          onClick={() => {
            if (!saved || value === saved.value || window.confirm("Discard unsaved changes and reload the file?"))
              run("previewFile");
          }}
        >
          Refresh
        </Button>
        <Button size="xs" disabled={busy || !saved} onClick={() => run("formatBrowserFile")}>
          Pretty print
        </Button>
        <Button
          size="xs"
          type="danger"
          disabled={busy || !saved}
          onClick={() => {
            if (window.confirm(`Permanently delete ${file}?`)) run("deleteBrowserFile");
          }}
        >
          Delete
        </Button>
        <Button
          size="xs"
          className="ml-auto"
          aria-label="Close file editor"
          title="Close file editor"
          disabled={busy}
          onClick={() => {
            if (!saved || value === saved.value || window.confirm("Discard unsaved changes?")) close();
          }}
        >
          <Icon icon="xmark" title={false} aria-hidden="true" className="size-4" />
        </Button>
      </div>
      {error && (
        <p role="alert" className="px-3 py-2 text-red-300">
          {error}
        </p>
      )}
      {busy && !saved && (
        <p role="status" className="p-3">
          Loading file…
        </p>
      )}
      {saved && (
        <div className="min-h-0 flex-1 overflow-auto [&_.CodeMirror]:text-xs">
          <CodeMirror
            value={value}
            lazyLoadMode={false}
            options={{
              theme: "monokai",
              mode: modes[file.split(".").pop().toLowerCase()] || "text/plain",
              lineNumbers: true,
              tabSize: 2,
              readOnly: busy,
              screenReaderLabel: `Edit ${file}`,
            }}
            onChange={(editor) => setValue(editor.getValue())}
            onKeyDown={(editor, event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                if (value !== saved.value) run("saveBrowserFile");
              }
            }}
          />
        </div>
      )}
    </section>
  );
};

export default GitFileViewer;
