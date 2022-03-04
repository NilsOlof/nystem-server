import React, { useEffect, useState, useRef } from "react";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";

const currentUrl = () =>
  new Promise((resolve) => {
    if (window.chrome.devtools)
      window.chrome.tabs.get(
        window.chrome.devtools.inspectedWindow.tabId,
        (tab) => resolve(tab.url)
      );
    else
      window.chrome.tabs.query({ currentWindow: true, active: true }, (tabs) =>
        resolve(tabs[0]?.url || "")
      );
  });

const ExtensionSearch = ({ model, view, path, setValue }) => {
  const [missing, setMissing] = useState(false);
  const ref = useRef();
  ref.current = setValue;

  useEffect(() => {
    const { extract, field } = model;

    currentUrl().then(async (url) => {
      const [, , val] = new RegExp(extract).exec(url) || [];
      if (!val) return;

      const { data } = await app().database[view.contentType].search({
        filter: { [field]: val },
        count: 1,
      });

      if (!data) {
        setMissing(true);
        return;
      }

      ref.current(data[0]);
      view.id = data[0]._id;
    });
  }, [model, view.contentType, view.id]);

  return missing ? <ContentTypeRender path={path} items={model.item} /> : null;
};

export default ExtensionSearch;
