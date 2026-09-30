import React, { useEffect, useRef, useState } from "react";
import app from "nystem";
import { Icon } from "nystem-components";
import Tooltip from "../tooltip";

const TextareaDeployLog = ({ view, value = "" }) => {
  const openKey = `serverPanelOpen${view.id}`;
  const [open, setOpen] = useState(() => sessionStorage.getItem(openKey) === "tasks");
  const [log, setLog] = useState(value);
  const [running, setRunning] = useState(Boolean(view.value.taskRunning));
  const [action, setAction] = useState(view.value.taskAction || "");
  const output = useRef(null);

  useEffect(() => {
    setOpen(sessionStorage.getItem(openKey) === "tasks");
  }, [openKey]);

  useEffect(() => {
    setLog(value);
    setRunning(Boolean(view.value.taskRunning));
    setAction(view.value.taskAction || "");
  }, [value, view.value.taskRunning, view.value.taskAction]);

  useEffect(() => {
    const update = ({ log, running, action }) => {
      setLog(log);
      setRunning(running);
      setAction(action);
    };
    const toggle = ({ open }) => setOpen(open === "tasks");
    app.connection.on(`serverTaskLog${view.id}`, update);
    app.connection.on(`serverPanel${view.id}`, toggle);
    return () => {
      app.connection.off(`serverTaskLog${view.id}`, update);
      app.connection.off(`serverPanel${view.id}`, toggle);
    };
  }, [view.id]);

  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [log, open]);

  if (!open) return null;

  return (
    <div className="flex h-100 max-h-128 flex-col bg-black text-gray-400 rounded shadow">
      <div className="flex shrink-0 flex-wrap items-center gap-2 p-2 bg-gray-900">
        <Tooltip text="Git status">
          <button type="button" aria-label="Git status" disabled={running} className={`inline-flex items-center justify-center h-8 w-8 rounded text-white ${running && action === "Git status" ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"}`} onClick={() => app.connection.emit({ type: "serverGitStatus", serverId: view.id })}>
            <Icon title={false} aria-hidden="true" icon="brands-git-alt" className={["h-4", "w-4"]} />
          </button>
        </Tooltip>
        <Tooltip text="Commit and push staged changes">
          <button type="button" aria-label="Commit and push staged changes" disabled={running} className={`inline-flex items-center justify-center h-8 w-8 rounded text-white ${running && action === "Commit" ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"}`} onClick={() => app.connection.emit({ type: "serverCommit", serverId: view.id })}>
            <Icon title={false} aria-hidden="true" icon="code-commit" className={["h-4", "w-4"]} />
          </button>
        </Tooltip>
        <Tooltip text="Deploy">
          <button type="button" aria-label="Deploy" disabled={running} className={`inline-flex items-center justify-center h-8 w-8 rounded text-white ${running && action === "Deploy" ? "bg-red-600 hover:bg-red-500" : "bg-blue-600 hover:bg-blue-500"}`} onClick={() => app.connection.emit({ type: "serverDeploy", serverId: view.id })}>
            <Icon title={false} aria-hidden="true" icon="rocket" className={["h-4", "w-4"]} />
          </button>
        </Tooltip>
        <Tooltip text="Open terminal">
          <button type="button" aria-label="Open terminal" className={`inline-flex items-center justify-center h-8 w-8 rounded text-white ${"bg-blue-600 hover:bg-blue-500"}`} onClick={() => app.connection.emit({ type: "serverProgram", serverId: view.id, program: "term" })}>
            <Icon title={false} aria-hidden="true" icon="terminal-solid" className={["h-4", "w-4"]} />
          </button>
        </Tooltip>
        <Tooltip text="Clear task log">
          <button type="button" aria-label="Clear task log" className="inline-flex items-center justify-center h-8 w-8 rounded bg-gray-800 text-gray-200 hover:bg-gray-700" onClick={() => {
            setLog("");
            app.connection.emit({ type: "serverTaskClear", serverId: view.id });
          }}>
            <Icon title={false} aria-hidden="true" icon="trash" className={["h-4", "w-4"]} />
          </button>
        </Tooltip>
        {running && <span className="ml-auto text-sm">{action} running</span>}
      </div>
      <div ref={output} className="min-h-0 flex-1 overflow-auto p-3 scrollbar scrollbar-dark">
        <pre className="whitespace-pre-wrap break-words">{log}</pre>
      </div>
    </div>
  );
};

export default TextareaDeployLog;
