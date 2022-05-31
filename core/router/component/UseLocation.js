import { useState, useEffect } from "react";

const checkMatch = {
  start: (path, match) => path.startsWith(match.substring(0, match.length - 1)),
  end: (path, match) => path.endsWith(match.substring(1)),
  includes: (path, match) =>
    path.includes(match.substring(1, match.length - 1)),
  exact: (path, match) => path === match,
};

const isMatch = (path, match) => {
  if (!match || match === "*") return "exact";

  if (!(match instanceof Array)) match = [match];

  return match.find((match) => {
    let checkType = match.endsWith("*") ? "start" : "exact";

    if (match.startsWith("*"))
      checkType = checkType === "start" ? "includes" : "end";

    return checkMatch[checkType](path, match);
  });
};

const UseLocation = (match) => {
  const [location, setLocation] = useState(window.location);
  useEffect(() => {
    const locationchange = () => {
      setLocation({ ...window.location });
    };
    window.addEventListener("locationchange", locationchange);
    return () => {
      window.removeEventListener("locationchange", locationchange);
    };
  }, []);

  return match
    ? { ...location, isMatch: isMatch(location.pathname, match) }
    : location;
};
export default UseLocation;

window.history.pushState = ((f) =>
  function pushState() {
    const ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("pushstate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  })(history.pushState);

history.replaceState = ((f) =>
  function replaceState() {
    const ret = f.apply(this, arguments);
    window.dispatchEvent(new Event("replacestate"));
    window.dispatchEvent(new Event("locationchange"));
    return ret;
  })(history.replaceState);

window.addEventListener("popstate", () => {
  window.dispatchEvent(new Event("locationchange"));
});
