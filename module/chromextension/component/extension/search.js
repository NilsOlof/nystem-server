import { useEffect, useState } from "react";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";

const ExtensionSearch = ({ model, path, view }) => {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let mounted = true;
    let searches = Promise.resolve();

    const find = () => {
      searches = searches
        .then(async () => {
          if (!app.connection.connected) await app.connection.event("connection", { wait: true });
          if (!mounted) return;
          const url = await new Promise((resolve) => {
            if (window.chrome.devtools) {
              window.chrome.tabs.get(window.chrome.devtools.inspectedWindow.tabId, (tab) => resolve(tab.url || ""));
              return;
            }
            window.chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => resolve(tabs[0]?.url || ""));
          });
          if (!mounted || !url) return;
          const val = model.field === "host" ? new URL(url).hostname : url.match(new RegExp(model.extract))?.[2];
          if (!val) return;

          const { data = [], offline } = await app.database[view.contentType].search({
            count: 1,
            filter: { [model.field]: val },
          });
          if (!mounted || offline) return;

          setMissing(!data[0]);
          view.id = data[0]?._id;
          if (view.value?._id !== view.id) await view.setValue({ value: data[0] || {} });
        })
        .catch((error) => console.warn("Extension server lookup", error));
      return searches;
    };
    const onConnection = ({ connected }) => {
      if (connected) find();
    };
    const onUpdated = (tabId, changeInfo) => {
      if (changeInfo.url && tabId === window.chrome.devtools?.inspectedWindow.tabId) find();
    };

    app.connection.on("connection", onConnection);
    app.database[view.contentType].on("update", find);
    app.on("login", find);
    window.chrome.tabs.onUpdated.addListener(onUpdated);
    find();

    return () => {
      mounted = false;
      app.connection.off("connection", onConnection);
      app.database[view.contentType].off("update", find);
      app.off("login", find);
      window.chrome.tabs.onUpdated.removeListener(onUpdated);
    };
  }, [model.extract, model.field, view]);

  return missing ? <ContentTypeRender path={path} items={model.item} /> : null;
};

export default ExtensionSearch;
