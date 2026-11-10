import { useEffect, useState } from "react";
import { Button, Wrapper } from "nystem-components";
import app from "nystem";

const DevtoolsAssistant = ({ model }) => {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState({});
  const [log, setLog] = useState([]);

  useEffect(() => {
    if (!window.chrome?.devtools) return;

    const { tabId } = window.chrome.devtools.inspectedWindow;
    let origin;
    let requests = [];
    let readers = {};
    let reads = [];
    const update = () => {
      setPending(requests);
      setApproved(readers);
      setLog(reads);
    };
    const register = () => app.connection.emit({ type: "devtoolsAssistantPanel", origin });
    const reply = (requestId, result) => app.connection.emit({ type: "devtoolsAssistantResult", requestId, ...result });
    const clear = () => {
      requests.forEach(({ requestId, timer }) => {
        clearTimeout(timer);
        reply(requestId, { error: "Assistant reads were not approved" });
      });
      requests = [];
      readers = {};
      update();
    };

    const read = async ({ requestId, requester, login, site, action, contentType, query = {} }) => {
      if (!["get", "search"].includes(action) || !/^\w+$/.test(contentType))
        return reply(requestId, { error: "Only get and search reads are allowed" });

      const grant = readers[requester];
      const { id, filter, sortby, reverse, count, position } = query;
      const {
        data,
        total,
        searchTotal,
        error,
        origin: replyOrigin,
      } = await app.event("devtools", {
        path: `database.${contentType}`,
        event: action,
        contentType,
        ...(action === "get"
          ? { id }
          : {
              filter,
              sortby,
              reverse,
              count: Math.min(Math.max(count, 1) || 20, 100),
              position: Math.max(Number(position), 0) || 0,
            }),
      });
      if (replyOrigin !== site) return reply(requestId, { error: error || "The reply came from another site" });
      if (readers[requester] !== grant) return reply(requestId, { error: "Assistant reads were stopped" });

      const rows = Array.isArray(data) ? data.length : Number(Boolean(data));
      reads = [{ requestId, login, action, contentType, query, rows, error }, ...reads].slice(0, 20);
      update();
      reply(requestId, { data, total, searchTotal, error });
    };

    const onRead = (request) => {
      if (request.site !== origin) return reply(request.requestId, { error: "The DevTools tab is on another site" });
      if (readers[request.requester]) return read(request);

      const answer = (allow) => {
        clearTimeout(request.timer);
        requests = requests.filter((item) => item !== request);
        if (allow) {
          readers = {
            ...readers,
            [request.requester]: {
              login: request.login,
              stop: () => {
                const { [request.requester]: removed, ...rest } = readers;
                readers = rest;
                update();
              },
            },
          };
          read(request);
        } else reply(request.requestId, { error: "Assistant reads were not approved" });
        update();
      };
      request.answer = answer;
      request.timer = setTimeout(() => answer(false), 2 * 60 * 1000);
      requests = [...requests, request];
      update();
    };

    const setOrigin = (url) => {
      origin = URL.parse(url)?.origin;
      clear();
      register();
    };
    const onUpdated = (id, { url }) => {
      if (id === tabId && url && URL.parse(url)?.origin !== origin) setOrigin(url);
    };
    const onConnection = ({ connected }) => {
      if (connected) register();
      else clear();
    };

    window.chrome.tabs.get(tabId, (tab) => setOrigin(tab.url));
    window.chrome.tabs.onUpdated.addListener(onUpdated);
    app.connection.on("devtoolsAssistantRead", onRead);
    app.connection.on("connection", onConnection);
    app.on("login", register);

    return () => {
      window.chrome.tabs.onUpdated.removeListener(onUpdated);
      app.connection.off("devtoolsAssistantRead", onRead);
      app.connection.off("connection", onConnection);
      app.off("login", register);
      clear();
      app.connection.emit({ type: "devtoolsAssistantPanel" });
    };
  }, []);

  if (!pending.length && !Object.keys(approved).length && !log.length) return null;

  return (
    <Wrapper className={model.className}>
      {pending.map(({ requestId, login, action, contentType, query, answer }) => (
        <div key={requestId} className="flex flex-wrap items-center gap-2 py-1">
          <span className="min-w-0 flex-1 truncate font-mono text-xs">
            {login} {action} {contentType} {JSON.stringify(query || {})}
          </span>
          <Button size="xs" type="primary" onClick={() => answer(true)}>
            Allow assistant reads
          </Button>
          <Button size="xs" onClick={() => answer(false)}>
            Deny
          </Button>
        </div>
      ))}
      {Object.entries(approved).map(([requester, { login, stop }]) => (
        <div key={requester} className="flex items-center gap-2 py-1">
          <span className="min-w-0 flex-1 truncate">{login} can read this site</span>
          <Button size="xs" onClick={stop}>
            Stop
          </Button>
        </div>
      ))}
      {log.map(({ requestId, login, action, contentType, query, rows, error }) => (
        <div key={requestId} className="truncate font-mono text-xs text-gray-400">
          {login} {action} {contentType} {JSON.stringify(query || {})} → {error || `${rows} rows`}
        </div>
      ))}
    </Wrapper>
  );
};

export default DevtoolsAssistant;
