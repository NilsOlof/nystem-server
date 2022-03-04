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

const DevtoolsView = ({ model, value }) => {
  useEffect(() => {
    if (!window.chrome) return;

    const callbacks = {};

    const onMessage = (message, sender) => {
      if (window.chrome.devtools.inspectedWindow.tabId !== sender.tab.id)
        return;

      if (message.init) app().event("devtools", message);
      if (!message.callbackId) return;

      callbacks[message.callbackId](message);
      delete callbacks[message.callbackId];
    };

    window.chrome.runtime.onMessage.addListener(onMessage);

    const send = (query) =>
      new Promise((resolve) => {
        query.callbackId = app().uuid();
        callbacks[query.callbackId] = resolve;

        setTimeout(() => {
          if (!callbacks[query.callbackId]) return;

          callbacks[query.callbackId](query);
          delete callbacks[query.callbackId];
        }, 4000);

        sendMessage({ nystem: "to", ...query });
      });
    app().on("devtools", send);

    return () => {
      window.chrome.runtime.onMessage.removeListener(onMessage);
      app().off("devtools", send);
    };
  }, []);

  return null;
};

export default DevtoolsView;
