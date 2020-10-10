import React, { useEffect, useState } from "react";
import { ContentTypeRender } from "nystem-components";

const currentUrl = () =>
  new Promise((resolve) =>
    window.chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
      resolve(tabs[0].url);
    })
  );

const ExtensionTab = (props) => {
  const { match, invert, children, item } = props.model || props;
  const [isMatch, setIsMatch] = useState();

  useEffect(() => {
    currentUrl().then((url) => setIsMatch(url.includes(match)));
  }, [match]);

  if (isMatch === undefined || (isMatch && invert) || (!isMatch && !invert))
    return null;

  return children || <ContentTypeRender path={props.path} items={item} />;
};
export default ExtensionTab;
