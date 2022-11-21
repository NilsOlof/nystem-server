import { useEffect } from "react";
import app from "nystem";

const sendMessage = (message) =>
  new Promise((resolve) =>
    window.chrome.tabs.sendMessage(
      window.chrome.devtools.inspectedWindow.tabId,
      message,
      resolve
    )
  );

const DevtoolsView = () => {
  useEffect(() => {
    if (!window.chrome) return;

    const callbacks = {};

    const onMessage = (message, sender) => {
      if (window.chrome.devtools.inspectedWindow.tabId !== sender.tab.id)
        return;

      if (!callbacks[message.devtoolsId]) {
        app().event("devtools", message);
        return;
      }

      callbacks[message.devtoolsId](message);
      delete callbacks[message.devtoolsId];
    };

    window.chrome.runtime.onMessage.addListener(onMessage);

    const send = (query) =>
      new Promise((resolve) => {
        query.devtoolsId = app().uuid();
        callbacks[query.devtoolsId] = resolve;

        setTimeout(() => {
          if (!callbacks[query.devtoolsId]) return;

          callbacks[query.devtoolsId](query);
          delete callbacks[query.devtoolsId];
        }, 4000);

        sendMessage({ nystem: "to", ...query });
      });
    app().on("devtools", send);

    return () => {
      window.chrome.runtime.onMessage.removeListener(onMessage);
      app().off("devtools", send);
    };
  }, []);

  useEffect(() => {
    let domain = "";
    const { tabId } = window.chrome.devtools.inspectedWindow;
    window.chrome.tabs.get(tabId, (tab) => {
      // eslint-disable-next-line prefer-destructuring
      domain = tab.url.split("/")[2].split(".")[0];
    });

    console.log("listning to", domain);
    const onNew = (tab) => {
      console.log(tab.pendingUrl, `nystem://${domain}`);
      if (!tab.pendingUrl.startsWith(`nystem://${domain}`)) return;

      app()
        .event("devtools", { path: "", event: "devtoolsnystvscode" })
        .then(({ base }) => {
          let path = tab.pendingUrl
            .replace(`nystem://${domain}`, base)
            .replace(/\.([0-9]+)$/, ":$1")
            .split("/");

          if (path[3] === "c") path[3] = "core";
          if (path[3] === "m") path[3] = "module";
          if (path[5] === "c") path[5] = "component";

          path = path.join("/");
          app().connection.emit({ type: "devtoolsnystvscode", path });
        });
      window.chrome.tabs.remove(tab.id);
    };
    window.chrome.tabs.onCreated.addListener(onNew);

    return () => {
      window.chrome.tabs.onCreated.removeListener(onNew);
    };
  }, []);

  return null;
};

export default DevtoolsView;
