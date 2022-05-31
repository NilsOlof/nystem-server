import { useState, useRef, useEffect, useCallback } from "react";
import { UseLocation } from "nystem-components";

const toType = {
  int: (val) => parseInt(val || 0, 10),
  float: (val) => parseFloat(val),
  array: (val) => (val === "" ? undefined : val),
};

const RouterUseQueryStore = (saveId, type, push) => {
  const location = UseLocation();

  const ref = useRef();
  const { search } = location;

  const getQueryValue = useCallback(
    (query) => {
      if (!saveId) return "";
      const reg = `\\&${saveId}=([^\\s&]+)`;
      const [, value = ""] = query.match(new RegExp(reg, "im")) || [];
      return type ? toType[type](value) : value;
    },
    [saveId, type]
  );

  const [value, setValue] = useState(
    saveId ? getQueryValue(search) : type ? toType[type]("") : ""
  );

  useEffect(() => {
    if (!push) return;

    const newVal = getQueryValue(search);
    if (newVal !== value) setValue(newVal);
  }, [getQueryValue, push, search, value]);

  const setRouterValue = (value) => {
    setValue(value);

    if (!saveId) return;

    const { pathname, search } = location;

    const reg = `(^\\?)|(\\&${saveId}=[^\\s&]*)`;
    const rest = search.replace(new RegExp(reg, "gi"), "");
    const add = value ? `&${saveId}=${value}` : "";

    window.history[push ? "pushState" : "replaceState"](
      {},
      "",
      `${pathname}?${rest}${add}`
    );
  };

  return [value, setRouterValue, ref];
};

export default RouterUseQueryStore;
