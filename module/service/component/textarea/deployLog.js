import React, { useContext, useEffect, useRef, useState } from "react";
import app from "nystem";
import { Icon, ContentTypeRender } from "nystem-components";
import Tooltip from "../tooltip";
import { GitContext } from "../../../git/client/context";

const TextareaDeployLog = ({ model, view, path, value = "" }) => {
  const [logs, setLogs] = useState({
    Commit: view.value.commitLog || "",
    Deploy: view.value.deployLog || "",
    [view.value.taskAction || ""]: value,
  });
  const [running, setRunning] = useState(Boolean(view.value.taskRunning));
  const [action, setAction] = useState(view.value.taskAction || "");
  const output = useRef(null);
  const { taskLog, showTaskLog } = useContext(GitContext);
  const showLog = taskLog.open;
  const log = logs[taskLog.action] || "";

  useEffect(() => {
    if (running) showTaskLog(true, action);
  }, [running, action, showTaskLog]);

  useEffect(() => {
    setLogs((logs) => ({ ...logs, [view.value.taskAction || ""]: value }));
    setRunning(Boolean(view.value.taskRunning));
    setAction(view.value.taskAction || "");
  }, [value, view.value.taskRunning, view.value.taskAction]);

  useEffect(() => {
    const update = ({ log, running, action }) => {
      setLogs((logs) => ({ ...logs, [action]: log }));
      setRunning(running);
      setAction(action);
    };
    app.connection.on(`serverTaskLog${view.id}`, update);
    return () => {
      app.connection.off(`serverTaskLog${view.id}`, update);
    };
  }, [view.id]);

  useEffect(() => {
    if (output.current) output.current.scrollTop = output.current.scrollHeight;
  }, [log, showLog]);

  if (model.stageArea && !showLog) return <ContentTypeRender path={path} items={model.item} />;

  return (
    <div className={model.controlsOnly ? "text-gray-400" : "flex flex-1 min-h-0 flex-col bg-black text-gray-400"}>
      {model.stageArea && (
        <div className="flex shrink-0 items-center justify-between border-b border-gray-700 bg-gray-800 px-3 py-2">
          <span>{taskLog.action} log</span>
          <button
            type="button"
            aria-label="Close task log"
            className="rounded px-2 py-1 text-gray-300 hover:bg-gray-700"
            onClick={() => showTaskLog(false, taskLog.action)}
          >
            <Icon title={false} aria-hidden="true" icon="xmark" className={["h-4", "w-4"]} />
          </button>
        </div>
      )}
      {!model.logOnly && (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {[
            { action: "Git status", text: "Git status", icon: "brands-git-alt", type: "serverGitStatus" },
            { action: "Commit", text: "Commit and push staged changes", icon: "code-commit", type: "serverCommit" },
            { action: "Deploy", text: "Deploy", icon: "rocket", type: "serverDeploy" },
          ].map((task) => (
            <Tooltip key={task.action} text={task.text}>
              <button
                type="button"
                aria-label={task.text}
                aria-pressed={showLog && taskLog.action === task.action}
                data-state={
                  running && action === task.action
                    ? "running"
                    : showLog && taskLog.action === task.action
                      ? "expanded"
                      : "closed"
                }
                disabled={running && action !== task.action}
                className={`inline-flex items-center justify-center h-8 w-8 rounded text-white ${running && action === task.action ? "bg-red-600 hover:bg-red-500" : showLog && taskLog.action === task.action ? "bg-blue-600 hover:bg-blue-500" : "bg-gray-600 hover:bg-gray-500"}`}
                onClick={() => {
                  if (showLog && taskLog.action === task.action) showTaskLog(false, task.action);
                  else {
                    showTaskLog(true, task.action);
                    if (!running) app.connection.emit({ type: task.type, serverId: view.id });
                  }
                }}
              >
                <Icon title={false} aria-hidden="true" icon={task.icon} className={["h-4", "w-4"]} />
              </button>
            </Tooltip>
          ))}
          {running && <span className="ml-auto text-sm">{action} running</span>}
        </div>
      )}
      {!model.controlsOnly && (model.stageArea || log || running) && (
        <div className="relative flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            aria-label="Clear task log"
            className="absolute right-2 top-2 z-10 rounded bg-gray-900/60 px-2 py-1 text-xs text-gray-500 hover:text-gray-300"
            onClick={() => {
              setLogs((logs) => ({ ...logs, [taskLog.action]: "" }));
              app.connection.emit({ type: "serverTaskClear", serverId: view.id, action: taskLog.action });
            }}
          >
            Clear
          </button>
          <div ref={output} className="min-h-0 flex-1 overflow-auto p-3 pr-16 scrollbar scrollbar-dark">
            <pre className="whitespace-pre-wrap break-words">{log}</pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default TextareaDeployLog;
