import React, { useEffect, useState } from "react";
import { SelectInput, UseSearch } from "nystem-components";

const DevtoolsUrlPartFilter = ({ model, view }) => {
  const [value, setValue] = useState("");
  const [url, setUrl] = useState("");

  const idVal = model.includeId ? ["$all", "_id"] : "$all";
  UseSearch({ view, id: idVal, value });

  useEffect(() => {
    const { tabId: id } = window.chrome.devtools.inspectedWindow;

    window.chrome.tabs.get(id, (tab) => setUrl(tab.url));

    const onChange = (tabId, changeInfo) => {
      if (tabId === id) setUrl(changeInfo.url);
    };
    window.chrome.tabs.onUpdated.addListener(onChange);

    return () => {
      window.chrome.tabs.onUpdated.removeListener(onChange);
    };
  }, []);

  return (
    <SelectInput
      model={{ ...model, option: url.split("/") }}
      value={value}
      setValue={setValue}
    />
  );
};

export default DevtoolsUrlPartFilter;
