import React, { useEffect, useState } from "react";
import { ContentTypeRender } from "nystem-components";
import app from "nystem";

const currentUrl = () =>
  new Promise((resolve) =>
    window.chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      resolve(tabs[0].url);
    })
  );

const ExtensionSearch = ({ model, view, path, setValue }) => {
  const [missing, setMissing] = useState(false);

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

      setValue(data[0]);
      view.id = data[0]._id;
    });
  }, [model, setValue, view]);

  return missing ? <ContentTypeRender path={path} items={model.item} /> : null;
};

export default ExtensionSearch;
