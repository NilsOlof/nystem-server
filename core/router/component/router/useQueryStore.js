import { useState, useRef, useEffect } from "react";
import { UseLocation } from "nystem-components";

const toType = {
  int: (val) => (val !== "" ? parseInt(val || 0, 10) : undefined),
  float: (val) => (val !== "" ? parseFloat(val || 0) : undefined),
  array: (val) => (val === "" ? undefined : val),
  text: (val) => val && decodeURIComponent(val),
};

const RouterUseQueryStore = (saveId, type, push, reload) => {
  const location = UseLocation();

  const ref = useRef();
  const { search } = location;
  const [value, setValue] = useState();
  ref.current = value;

  useEffect(() => {
    if (!saveId) return;

    const getQueryValue = (query) => {
      if (!saveId) return "";
      const reg = `\\&${saveId}=([^\\s&]+)`;
      const [, value = ""] = query.match(new RegExp(reg, "im")) || [];
      return type ? toType[type](value) : toType.text(value);
    };

    const newVal = getQueryValue(search);
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
      `${pathname}?${rest}${add}`
    );
  };

  return [value === "" ? undefined : value, setRouterValue];
};

export default RouterUseQueryStore;
