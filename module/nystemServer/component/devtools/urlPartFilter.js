import React, { useEffect, useState } from "react";
import { SelectInput, useSearch } from "nystem-components";

const searchFields = ["$all", "_id"];

const DevtoolsUrlPartFilter = ({ model, view }) => {
  const [value, setValue] = useState("");
  const [url, setUrl] = useState("");

  useSearch({ view, id: model.includeId ? searchFields : "$all", value });

  useEffect(() => {
    if (!window.chrome?.devtools) return;
    const { tabId: id } = window.chrome.devtools.inspectedWindow;

    window.chrome.tabs.get(id, (tab) => setUrl(tab.url || ""));

    const onChange = (tabId) => {
      if (tabId === id) window.chrome.tabs.get(id, (tab) => setUrl(tab.url || ""));
    };
    window.chrome.tabs.onUpdated.addListener(onChange);

    return () => {
      window.chrome.tabs.onUpdated.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    if (value && !url.split(/[/?#]/).slice(3).includes(value)) setValue("");
  }, [url, value]);

  return (
    <SelectInput
      model={{
        ...model,
        option: url.split(/[/?#]/).slice(3).filter(Boolean),
        inline: true,
        limit: 1,
        render: "button",
      }}
      value={value}
      setValue={setValue}
    />
  );
};

export default DevtoolsUrlPartFilter;
