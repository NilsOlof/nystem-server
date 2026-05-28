import { useState, useRef, useEffect } from "react";
import { useLocation } from "nystem-components";

const toType = {
  int: (val) => (val !== "" ? parseInt(val || 0, 10) : undefined),
  float: (val) => (val !== "" ? parseFloat(val || 0) : undefined),
  array: (val) => (val === "" ? undefined : val),
  text: (val) => val && decodeURIComponent(val),
};

const getQueryValue = (query, type, saveId) => {
  if (!saveId) return "";
  const reg = `\\&${saveId}=([^\\s&]+)`;
  const [, value = ""] = query.match(new RegExp(reg, "im")) || [];
  return type ? toType[type](value) : toType.text(value);
};

const useRouterQueryStore = (saveId, type, push, reload) => {
  const location = useLocation();

  const ref = useRef();
  const { search } = location;

  const [value, setValue] = useState(getQueryValue(search, type, saveId));
  ref.current = value;

  useEffect(() => {
    if (!saveId) return;

    const newVal = getQueryValue(search, type, saveId);
    if (newVal !== ref.current) setValue(newVal);
  }, [saveId, search, type]);

  const setRouterValue = (value) => {
    setValue(value);

    if (!saveId) return;

    const { search } = window.location;
    const { pathname } = location;
    const reg = `(^\\?)|(\\&${saveId}=[^\\s&]*)`;
    const rest = search.replace(new RegExp(reg, "gi"), "");
    const add = value
      ? `&${saveId}=${value.toString().replace(/ /g, "%20")}`
      : "";

    window.history[push ? "pushState" : "replaceState"](
      {},
      "",
      `${pathname}?${rest}${add}`,
    );
  };

  return [value === "" ? undefined : value, setRouterValue];
};

export default useRouterQueryStore;
