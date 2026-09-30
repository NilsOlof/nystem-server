import React, { useContext, useRef } from "react";
import { Button, Wrapper } from "nystem-components";
import { GitContext } from "../../client/context";
const GitFiles = ({ model }) => {
  const { files, selected, setSelected, search, busy, act } = useContext(GitContext);
  const group = files.filter((file) => file.side === model.side);
  const visible = group.filter((file) => file.path.toLowerCase().includes(search.toLowerCase()));
  const list = useRef(null);
  return (
    <Wrapper className={model.className}>
      <div className="flex items-center gap-2 bg-gray-700 px-3 py-2">
        <span className="flex-grow">
          {model.text} ({group.length})
        </span>
        <Button
          size="xs"
          disabled={busy || !visible.length}
          onClick={() => act(model.side === "staged" ? "unstage" : "stage", visible)}
        >
          {search ? "Apply to filtered" : model.side === "staged" ? "Unstage all" : "Stage all"}
        </Button>
      </div>
      <div ref={list} className="min-h-0 flex-1 overflow-auto p-2">
        {visible.map((file, index) => (
          <div
            key={file.path}
            className={`flex items-center gap-2 rounded px-2 py-1 ${selected?.path === file.path && selected.side === file.side ? "bg-blue-600 text-white" : "hover:bg-gray-800"}`}
          >
            <input
              type="checkbox"
              aria-label={`${file.side === "staged" ? "Unstage" : "Stage"} ${file.path}`}
              checked={file.side === "staged"}
              disabled={busy || file.conflict}
              onChange={() => act(file.side === "staged" ? "unstage" : "stage", [file])}
            />
            <span
              className={
                file.conflict
                  ? "text-red-300"
                  : file.code === "?"
                    ? "text-purple-300"
                    : file.code === "A"
                      ? "text-green-300"
                      : "text-orange-300"
              }
            >
              {file.code}
            </span>
            <Wrapper
              renderAs="button"
              type="button"
              data-git-file="true"
              autoFocus={selected?.path === file.path && selected.side === file.side}
              data-git-path={file.path}
              data-git-side={file.side}
              className={["min-w-0", "flex-1", "truncate", "text-left"]}
              onClick={() => !busy && setSelected(file)}
              onKeyDown={(event) => {
                if (event.key === " ") {
                  event.preventDefault();
                  if (!busy && !file.conflict) act(file.side === "staged" ? "unstage" : "stage", [file]);
                  return;
                }
                if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
                event.preventDefault();
                const next = Math.max(0, Math.min(visible.length - 1, index + (event.key === "ArrowDown" ? 1 : -1)));
                setSelected(visible[next]);
                list.current.querySelectorAll("button[data-git-file]")[next]?.focus();
              }}
              title={file.original ? `${file.original} → ${file.path}` : file.path}
            >
              {file.path}
            </Wrapper>
          </div>
        ))}
        {!visible.length && (
          <p className="px-2 py-3 text-gray-500">{group.length ? "No matching files" : "No changes"}</p>
        )}
      </div>
    </Wrapper>
  );
};
export default GitFiles;
