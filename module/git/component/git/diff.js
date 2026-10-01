import React, { useContext } from "react";
import { Button, Wrapper } from "nystem-components";
import app from "nystem";
import { GitContext } from "../../client/context";
const GitDiff = ({ model, view }) => {
  const { selected, preview, whole, setWhole, busy, act } = useContext(GitContext);
  const canHunk = selected && !selected.conflict && selected.code !== "?" && !selected.original;
  const action = selected?.side === "staged" ? "unstage" : "stage";
  const displayed = whole ? preview?.full : preview?.compact;
  return (
    <Wrapper className={model.className}>
      <div className="flex shrink-0 items-center gap-3 bg-gray-800 px-3 py-2">
        <span className="min-w-0 flex-1 truncate">{selected?.path || "Select a file"}</span>
        <label className="flex items-center gap-2 whitespace-nowrap">
          <input type="checkbox" checked={whole} onChange={(event) => setWhole(event.target.checked)} />
          Expand whole file
        </label>
        {selected && (
          <Button size="xs" disabled={busy || !preview || selected.conflict} onClick={() => act(action, [selected])}>
            {action === "stage" ? "Stage file" : "Unstage file"}
          </Button>
        )}
        {selected?.side === "unstaged" && selected.code !== "?" && !selected.original && (
          <Button
            size="xs"
            type="danger"
            disabled={busy || !preview || selected.conflict}
            onClick={() => act("discard", [selected])}
          >
            Discard file
          </Button>
        )}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
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
                      <Button size="xs" disabled={busy} onClick={() => act(action, [selected], compactIndex)}>
                        {action === "stage" ? "Stage hunk" : "Unstage hunk"}
                      </Button>
                      {selected.side === "unstaged" && (
                        <Button size="xs" disabled={busy} onClick={() => act("discard", [selected], compactIndex)}>
                          Discard hunk
                        </Button>
                      )}
                    </div>
                  )}
                  <div
                    className={`flex font-mono text-xs leading-5 ${line.kind === "added" ? "bg-emerald-950 text-emerald-300" : line.kind === "removed" ? "bg-red-950 text-red-300" : "text-gray-300"}`}
                  >
                    {[line.old, line.new].map((number, column) => (
                      <button
                        key={column}
                        type="button"
                        disabled={!number}
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
        {!selected && <p className="p-4 text-gray-500">Working tree is clean.</p>}
      </div>
    </Wrapper>
  );
};
export default GitDiff;
