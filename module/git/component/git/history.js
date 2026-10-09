import React, { useEffect, useMemo, useState } from "react";
import { DateView } from "nystem-components";
import { GitContext } from "../../client/context";
import GitDiff from "./diff";

const GitHistory = ({ history, historySelected, setHistorySelected, error, request, view }) => {
  const [commit, setCommit] = useState(null);
  const [selected, setSelected] = useState(null);
  const [preview, setPreview] = useState(null);
  const [whole, setWhole] = useState(false);
  const [search, setSearch] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [height, setHeight] = useState(45);

  useEffect(() => {
    let active = true;
    setCommit(null);
    setSelected(null);
    setPreview(null);
    setDetailsError("");
    if (!historySelected) return;
    request({ action: "historyCommit", hash: historySelected })
      .then(({ commit }) => {
        if (!active) return;
        setCommit(commit);
        setSelected(commit.files[0] || null);
      })
      .catch((error) => active && setDetailsError(error.message));
    return () => {
      active = false;
    };
  }, [historySelected, request]);

  useEffect(() => {
    let active = true;
    setPreview(null);
    if (!selected || commit?.hash !== historySelected) return;
    setDetailsError("");
    request({ action: "historyDiff", hash: historySelected, path: selected.path, whole })
      .then(({ diff }) => {
        if (active) setPreview({ compact: diff, full: diff });
      })
      .catch((error) => active && setDetailsError(error.message));
    return () => {
      active = false;
    };
  }, [selected, commit?.hash, historySelected, whole, request]);
  const graph = useMemo(() => {
    let lanes = [];
    let width = 1;
    let color = 0;
    const colors = ["#78b7ef", "#d9a478", "#85c4ac", "#b39cda", "#d7c58a", "#81becb"];
    const rows = (history || []).map((commit) => {
      let lane = lanes.findIndex(({ hash }) => hash === commit.hash);
      if (lane < 0) {
        lane = lanes.length;
        lanes.push({ hash: commit.hash, color: colors[color++ % colors.length] });
      }
      const next = lanes.filter(({ hash }) => hash !== commit.hash);
      commit.parents.forEach((hash, index) => {
        if (!next.some((item) => item.hash === hash))
          next.splice(Math.min(lane + index, next.length), 0, {
            hash,
            color: index ? colors[color++ % colors.length] : lanes[lane].color,
          });
      });
      width = Math.max(width, lanes.length, next.length);
      const paths = lanes.flatMap((item, index) => {
        if (index === lane)
          return commit.parents.map((hash) => ({
            color: next.find((item) => item.hash === hash).color,
            d: `M ${lane * 18 + 12} 17 L ${next.findIndex((item) => item.hash === hash) * 18 + 12} 34`,
          }));
        return [
          {
            color: item.color,
            d: `M ${index * 18 + 12} 0 L ${index * 18 + 12} 17 L ${next.findIndex(({ hash }) => hash === item.hash) * 18 + 12} 34`,
          },
        ];
      });
      paths.push({ color: lanes[lane].color, d: `M ${lane * 18 + 12} 0 L ${lane * 18 + 12} 17` });
      const row = { ...commit, lane, color: lanes[lane].color, paths };
      lanes = next;
      return row;
    });
    return { rows, width: width * 18 + 12 };
  }, [history]);

  return (
    <div className="git-history-surface flex min-h-0 flex-1 flex-col bg-[#232323]">
      <div className="min-h-0 flex-1 overflow-auto scrollbar scrollbar-dark">
        {error ? (
          <p role="alert" className="p-3 text-red-300">
            {error}
          </p>
        ) : history === null ? (
          <p className="p-3 text-gray-400">Loading history…</p>
        ) : !history.length ? (
          <p className="p-3 text-gray-400">No commits</p>
        ) : (
          <div className="min-w-[40rem]" role="list" aria-label="Commit history">
            {graph.rows.map((commit) => (
              <div key={commit.hash} role="listitem">
                <button
                  type="button"
                  aria-pressed={historySelected === commit.hash}
                  className={`git-history-row flex h-[34px] w-full items-center gap-3 pr-3 text-left ${historySelected === commit.hash ? "bg-blue-600 text-white" : "hover:bg-gray-800"}`}
                  onClick={() => setHistorySelected(commit.hash)}
                >
                  <svg width={graph.width} height="34" className="shrink-0" aria-hidden="true">
                    {commit.paths.map((path, index) => (
                      <path key={index} d={path.d} stroke={path.color} strokeWidth="2" fill="none" />
                    ))}
                    <circle cx={commit.lane * 18 + 12} cy="17" r="4" fill={commit.color} />
                  </svg>
                  <span className="flex min-w-0 flex-1 items-center gap-1 whitespace-nowrap">
                    {commit.refs.map((ref) => (
                      <span
                        key={ref}
                        className={`git-ref shrink-0 rounded ${ref.includes("develop") ? "git-ref-orange" : "git-ref-blue"}`}
                      >
                        {ref}
                      </span>
                    ))}
                    <span className="truncate" title={commit.subject}>
                      {commit.subject}
                    </span>
                  </span>
                  <span className="git-history-meta w-16 shrink-0 font-mono" title={commit.hash}>
                    {commit.hash.slice(0, 7)}
                  </span>
                  <DateView
                    value={commit.date}
                    model={{
                      renderAs: "span",
                      dateFormat: "dateTimeLong",
                      className: ["git-history-meta", "w-36", "shrink-0"],
                    }}
                  />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        role="separator"
        aria-label="Resize history and commit panels"
        aria-orientation="horizontal"
        aria-valuemin={25}
        aria-valuemax={75}
        aria-valuenow={height}
        tabIndex={0}
        className="h-2 shrink-0 cursor-row-resize touch-none border-y border-gray-700 bg-gray-800 hover:bg-slate-600"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
          const bounds = event.currentTarget.parentElement.getBoundingClientRect();
          setHeight(Math.max(25, Math.min(75, ((bounds.bottom - event.clientY) / bounds.height) * 100)));
        }}
        onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        onKeyDown={(event) => {
          if (!["ArrowUp", "ArrowDown"].includes(event.key)) return;
          event.preventDefault();
          setHeight(Math.max(25, Math.min(75, height + (event.key === "ArrowUp" ? 5 : -5))));
        }}
      />
      <div className="flex min-h-0 shrink-0 flex-col" style={{ height: `${height}%` }}>
        <div className="flex shrink-0 items-center gap-3 border-b border-gray-700 bg-gray-800 px-3 py-2">
          <span className="flex-1 text-xs text-gray-400">
            Changed files{commit && ` (${commit.files.length})`} · Sorted by path
          </span>
          <input
            type="search"
            aria-label="Search commit files"
            placeholder="Search files"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-40 rounded border border-gray-600 bg-gray-900 px-2 py-1 text-xs"
          />
        </div>
        {detailsError && (
          <p role="alert" className="shrink-0 p-3 text-red-300">
            {detailsError}
          </p>
        )}
        <div className="grid min-h-0 flex-1 grid-cols-[minmax(12rem,1fr)_minmax(0,2fr)]">
          <div className="flex min-h-0 min-w-0 flex-col border-r border-gray-700">
            <div className="min-h-0 flex-1 overflow-auto p-2" role="list" aria-label="Commit files">
              {commit?.files
                .filter((file) => file.path.toLowerCase().includes(search.toLowerCase()))
                .map((file) => (
                  <button
                    key={file.path}
                    type="button"
                    aria-pressed={selected?.path === file.path}
                    title={file.original ? `${file.original} → ${file.path}` : file.path}
                    className={`git-file-row flex w-full items-center gap-2 rounded text-left text-xs ${selected?.path === file.path ? "bg-blue-600 text-white" : "hover:bg-gray-800"}`}
                    onClick={() => setSelected(file)}
                  >
                    <span
                      className={
                        file.code === "A" ? "text-emerald-300" : file.code === "D" ? "text-red-300" : "text-orange-300"
                      }
                    >
                      {file.code}
                    </span>
                    <span className="min-w-0 truncate">{file.path}</span>
                  </button>
                ))}
              {!commit && (
                <p className="p-2 text-xs text-gray-400">
                  {detailsError ? "Commit unavailable" : historySelected ? "Loading commit…" : "Select a commit"}
                </p>
              )}
              {commit && !commit.files.length && <p className="p-2 text-xs text-gray-400">No changed files</p>}
              {commit?.files.length > 0 &&
                !commit.files.some((file) => file.path.toLowerCase().includes(search.toLowerCase())) && (
                  <p className="p-2 text-xs text-gray-400">No matching files</p>
                )}
            </div>
            {commit && (
              <div className="max-h-[50%] shrink-0 overflow-auto border-t border-gray-700 bg-gray-800 p-3 text-xs">
                <p className="mb-3 whitespace-pre-wrap break-words">{commit.message}</p>
                <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-2 gap-y-1">
                  <dt className="text-gray-400">Commit</dt>
                  <dd className="break-all font-mono">{commit.hash}</dd>
                  <dt className="text-gray-400">Parents</dt>
                  <dd className="break-all">
                    {commit.parents.length
                      ? commit.parents.map((hash) => (
                          <button
                            key={hash}
                            type="button"
                            className="mr-2 text-blue-300 hover:underline"
                            onClick={() => setHistorySelected(hash)}
                          >
                            {hash.slice(0, 10)}
                          </button>
                        ))
                      : "None"}
                  </dd>
                  <dt className="text-gray-400">Author</dt>
                  <dd className="break-words">
                    {commit.author} &lt;{commit.email}&gt;
                  </dd>
                  <dt className="text-gray-400">Date</dt>
                  <dd>
                    <DateView value={commit.date} model={{ renderAs: "span", dateFormat: "dateTimeLong" }} />
                  </dd>
                  <dt className="text-gray-400">Labels</dt>
                  <dd className="break-words">
                    {history?.find(({ hash }) => hash === commit.hash)?.refs.join(" ") || "None"}
                  </dd>
                </dl>
              </div>
            )}
          </div>
          <GitContext.Provider value={{ selected, preview, whole, setWhole, readOnly: true }}>
            <GitDiff model={{ className: ["flex", "min-h-0", "min-w-0", "flex-col"] }} view={view} />
          </GitContext.Provider>
        </div>
      </div>
    </div>
  );
};

export default GitHistory;
