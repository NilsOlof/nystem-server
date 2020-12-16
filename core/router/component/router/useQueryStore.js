import { useState, useRef } from "react";
import { useHistory } from "react-router-dom";

const toType = {
  int: (val) => parseInt(val, 10),
  float: (val) => parseFloat(val),
  array: (val) => (val === "" ? undefined : val),
};

const RouterUseQueryStore = (saveId, type) => {
  const history = useHistory();

  const ref = useRef();
  const { search } = history.location;
  const getQueryValue = (query) => {
    if (!saveId) return "";
    const reg = `\\&${saveId}=([^\\s&]+)`;
    const [, value = ""] = query.match(new RegExp(reg, "im")) || [];
    return type ? toType[type](value) : value;
  };

  const [value, setValue] = useState(
    saveId ? getQueryValue(search) : type ? toType[type]("") : ""
  );

  const setRouterValue = (value) => {
    setValue(value);

    if (!saveId) return;

    const { pathname, search } = history.location;

    const reg = `(^\\?)|(\\&${saveId}=[^\\s&]*)`;
    const rest = search.replace(new RegExp(reg, "gi"), "");
    const add = value ? `&${saveId}=${value}` : "";

    history.replace(`${pathname}?${rest}${add}`);
  };

  return [value, setRouterValue, ref];
};

export default RouterUseQueryStore;
