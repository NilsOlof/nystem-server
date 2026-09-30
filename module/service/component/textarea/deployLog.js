import React, { useEffect, useRef, useState } from "react";
import app from "nystem";
import { Icon } from "nystem-components";

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
        <button type="button" disabled={running} className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500 disabled:opacity-50" onClick={() => app.connection.emit({ type: "serverGitStatus", serverId: view.id })}>
          <Icon icon="brands-git-alt" className={["h-4", "w-4"]} /> Status
        </button>
        <button type="button" disabled={running} className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500 disabled:opacity-50" onClick={() => app.connection.emit({ type: "serverCommit", serverId: view.id })}>
          <Icon icon="code-commit" className={["h-4", "w-4"]} /> Commit
        </button>
        <button type="button" disabled={running} className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500 disabled:opacity-50" onClick={() => app.connection.emit({ type: "serverDeploy", serverId: view.id })}>
          <Icon icon="rocket" className={["h-4", "w-4"]} /> Deploy
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-500" onClick={() => app.connection.emit({ type: "serverProgram", serverId: view.id, program: "term" })}>
          <Icon icon="terminal-solid" className={["h-4", "w-4"]} /> Terminal
        </button>
        <button type="button" className="inline-flex items-center gap-2 rounded bg-gray-800 px-3 py-1 text-gray-200 hover:bg-gray-700" onClick={() => {
          setLog("");
          app.connection.emit({ type: "serverTaskClear", serverId: view.id });
        }}>
          <Icon icon="trash" className={["h-4", "w-4"]} /> Clear
        </button>
        {running && <span className="ml-auto text-sm">{action} running</span>}
      </div>
      <div ref={output} className="min-h-0 flex-1 overflow-auto p-3 scrollbar scrollbar-dark">
        <pre className="whitespace-pre-wrap break-words">{log}</pre>
      </div>
    </div>
  );
};

export default TextareaDeployLog;
