import React, { useEffect, useState } from "react";
import { ContentTypeRender } from "nystem-components";

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

const ExtensionTab = (props) => {
  const { match, invert, children, item } = props.model || props;
  const [isMatch, setIsMatch] = useState();

  useEffect(() => {
    currentUrl().then((url) => setIsMatch(url.includes(match)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isMatch === undefined || (isMatch && invert) || (!isMatch && !invert))
    return null;

  return children || <ContentTypeRender path={props.path} items={item} />;
};
export default ExtensionTab;
