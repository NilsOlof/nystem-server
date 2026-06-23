import { useEffect, useState } from "react";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";

const ExtensionSearch = ({ model, path, view, setValue }) => {
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    let mounted = true;

    new Promise((resolve) => {
      if (window.chrome.devtools) {
        window.chrome.tabs.get(
          window.chrome.devtools.inspectedWindow.tabId,
          (tab) => resolve(tab.url || ""),
        );
        return;
      }

      window.chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        resolve(tabs[0]?.url || ""),
      );
    }).then(async (url) => {
      const [, , val] = url.match(new RegExp(model.extract)) || [];
      if (!mounted || !val) return;

      const { data = [] } = await app.database[view.contentType].search({
        count: 1,
        filter: { [model.field]: val },
      });

      if (!mounted) return;

      if (!data[0]) {
        setMissing(true);
        return;
      }

      setValue(data[0]);
      view.id = data[0]._id;
    });

    return () => {
      mounted = false;
    };
  }, [model.extract, model.field, setValue, view]);

  return missing ? <ContentTypeRender path={path} items={model.item} /> : null;
};

export default ExtensionSearch;
