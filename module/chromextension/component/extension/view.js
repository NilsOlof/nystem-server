import React, { useEffect, useState } from "react";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";

const ExtensionView = ({ invert, model = {}, path, view, setValue, children }) => {
  const [missing, setMissing] = useState(false);
  const inExtension = window.location.protocol === "chrome-extension:";
  invert = invert || model.invert;

  useEffect(() => {
    if (model.format !== "search") return;
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

      if (view.value?._id !== data[0]._id) setValue(data[0]);
      view.id = data[0]._id;
    });

    return () => {
      mounted = false;
    };
  }, [model.extract, model.field, model.format, setValue, view]);

  if ((inExtension && invert) || (!inExtension && !invert)) return null;
  if (model.format === "search" && !missing) return null;

  return children || <ContentTypeRender path={path} items={model.item} />;
};
export default ExtensionView;
