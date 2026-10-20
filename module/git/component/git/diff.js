import React, { useContext } from "react";
import { Button, Wrapper } from "nystem-components";
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
import app from "nystem";
import { GitContext } from "../../client/context";
const GitDiff = ({ model, view }) => {
  const { selected, preview, whole, setWhole, busy, edit, setEdit, editFile, act, readOnly } = useContext(GitContext);
  const canHunk = !readOnly && selected && !selected.conflict && selected.code !== "?" && !selected.original;
  const action = selected?.side === "staged" ? "unstage" : "stage";
  const displayed = whole ? preview?.full : preview?.compact;
  return (
    <Wrapper className={model.className}>
      <div className="flex shrink-0 items-center gap-3 bg-gray-800 px-3 py-2">
        <span
          className="min-w-0 flex-1 truncate"
          title={selected?.original ? `${selected.original} → ${selected.path}` : selected?.path}
        >
          {selected?.original ? `${selected.original} → ${selected.path}` : selected?.path || "Select a file"}
        </span>
        {!edit && (
          <Button size="xs" type={whole ? "primary" : "default"} aria-pressed={whole} onClick={() => setWhole(!whole)}>
            Whole file
          </Button>
        )}
        {edit ? (
          <>
            <Button size="xs" aria-disabled={busy} onClick={() => editFile("save")}>
              Save
            </Button>
            <Button size="xs" aria-disabled={busy} onClick={() => !busy && setEdit(null)}>
              Cancel
            </Button>
          </>
        ) : (
          !readOnly &&
          selected && (
            <Button
              size="xs"
              disabled={selected.code === "D" || preview?.full.binary}
              aria-disabled={busy || selected.code === "D" || preview?.full.binary}
              onClick={() => editFile("read")}
            >
              Edit file
            </Button>
          )
        )}
        {!readOnly && !edit && selected && (
          <Button
            size="xs"
            disabled={selected.conflict}
            aria-disabled={busy || !preview || selected.conflict}
            onClick={() => !busy && preview && act(action, [selected])}
          >
            {action === "stage" ? "Stage file" : "Unstage file"}
          </Button>
        )}
        {!readOnly && !edit && selected?.side === "unstaged" && !selected.original && (
          <Button
            size="xs"
            type="danger"
            disabled={selected.conflict}
            aria-disabled={busy || !preview || selected.conflict}
            onClick={() => !busy && preview && act("discard", [selected])}
          >
            {selected.code === "?" ? "Delete file" : "Discard file"}
          </Button>
        )}
      </div>
      {edit ? (
        <div
          key="editor"
          className="min-h-0 flex-1 overflow-hidden [&_.CodeMirror]:font-mono [&_.CodeMirror]:text-xs [&_.CodeMirror]:leading-5"
        >
          <CodeMirror
            value={edit.value}
            lazyLoadMode={false}
            options={{
              theme: "monokai",
              mode:
                {
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
                }[edit.path.split(".").pop().toLowerCase()] || "text/plain",
              lineNumbers: true,
              tabSize: 2,
              readOnly: busy,
              autofocus: true,
              screenReaderLabel: `Edit ${edit.path}`,
            }}
            onChange={(editor) => {
              const value = editor.getValue();
              if (value !== edit.value) setEdit({ ...edit, value });
            }}
            onKeyDown={(editor, event) => {
              if ((event.ctrlKey || event.metaKey) && event.key === "s") {
                event.preventDefault();
                editFile("save");
              }
            }}
          />
        </div>
      ) : (
        <div key="diff" className="min-h-0 flex-1 overflow-auto">
          {selected?.conflict && (
            <p className="p-4 text-red-300">Merge conflict. Resolve the conflict before staging this file.</p>
          )}
          {displayed?.binary && <p className="p-4 text-gray-400">Binary file; use the file staging controls.</p>}
          {preview && !displayed?.binary && !displayed.hunks.length && (
            <p className="p-4 text-gray-400">No text diff (empty file, mode change, or rename).</p>
          )}
          {displayed?.hunks.map((hunk, index) => (
            <div key={index} className="min-w-max">
              <div className="bg-gray-800 px-3 py-2 text-gray-400">{whole ? "Whole file" : hunk.title}</div>
              {hunk.lines.map((line, row) => {
                const compactIndex = whole
                  ? preview.compact.hunks.findIndex((compact) => {
                      const first = compact.lines.find((item) => item.kind === "added" || item.kind === "removed");
                      return first && first.old === line.old && first.new === line.new && first.kind === line.kind;
                    })
                  : row === 0
                    ? index
                    : -1;
                return (
                  <React.Fragment key={row}>
                    {compactIndex >= 0 && canHunk && (
                      <div className="flex items-center gap-2 border-y border-gray-700 px-3 py-1">
                        <span className="flex-1 text-gray-500">{preview.compact.hunks[compactIndex].title}</span>
                        <Button size="xs" aria-disabled={busy} onClick={() => act(action, [selected], compactIndex)}>
                          {action === "stage" ? "Stage hunk" : "Unstage hunk"}
                        </Button>
                        {selected.side === "unstaged" && (
                          <Button
                            size="xs"
                            aria-disabled={busy}
                            onClick={() => act("discard", [selected], compactIndex)}
                          >
                            Discard hunk
                          </Button>
                        )}
                      </div>
                    )}
                    <div
                      className={`flex font-mono text-[12px] leading-[18px] ${line.kind === "added" ? "bg-emerald-950 text-emerald-300" : line.kind === "removed" ? "bg-red-950 text-red-300" : "text-gray-300"}`}
                    >
                      {[line.old, line.new].map((number, column) => (
                        <button
                          key={column}
                          type="button"
                          disabled={readOnly || !number}
                          className="w-12 shrink-0 select-none pr-2 text-right text-gray-500 enabled:hover:text-blue-300 enabled:hover:underline disabled:cursor-default"
                          title={number ? `Open ${selected.path}:${number} in VS Code` : undefined}
                          onClick={() =>
                            app.connection.emit({
                              type: "devtoolsnystvscode",
                              server: view.id,
                              path: `${selected.path}:${number}`,
                            })
                          }
                        >
                          {number}
                        </button>
                      ))}
                      <span className="w-5 shrink-0 select-none">
                        {line.kind === "added" ? "+" : line.kind === "removed" ? "−" : ""}
                      </span>
                      <pre className="m-0 whitespace-pre pr-4">{line.text}</pre>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          ))}
          {!selected && (
            <p className="p-4 text-gray-500">
              {readOnly ? "Select a file to view its changes." : "Working tree is clean."}
            </p>
          )}
        </div>
      )}
    </Wrapper>
  );
};
export default GitDiff;
