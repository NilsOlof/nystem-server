import { useState, useEffect, useCallback } from "react";
import { useHistory } from "react-router-dom";

const toType = {
  reference: (val) => val,
  text: (val) => val,
  select: (val) => val,
  int: (val) => parseInt(val || 0, 10),
  float: (val) => parseFloat(val),
  array: (val) => (val === "" ? undefined : val),
};

const TextQueryValue = ({ model, setValue, value }) => {
  const { saveId, type, push } = model;
  const history = useHistory();
  const [enabled, setEnabled] = useState(false);

  const { search } = history.location;

  const getQueryValue = useCallback(
    (query) => {
      if (!saveId) return "";
      const reg = `\\&${saveId}=([^\\s&]+)`;
      const [, value = ""] = query.match(new RegExp(reg, "im")) || [];
      return type ? toType[type](value) : value;
    },
    [saveId, type]
  );

  const setRouterValue = (value) => {
    if (!saveId) return;

    const { pathname, search } = history.location;

    const reg = `(^\\?)|(\\&${saveId}=[^\\s&]*)`;
    const rest = search.replace(new RegExp(reg, "gi"), "");
    const add = value ? `&${saveId}=${value}` : "";

    history[push ? "push" : "replace"](`${pathname}?${rest}${add}`);
  };

  const qVal = getQueryValue(search);

  value = value || "";
  if (enabled && value !== qVal) setRouterValue(value);

  useEffect(() => {
    if (value) return;

    setTimeout(() => {
      if (qVal) setValue(qVal);
      setEnabled(true);
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default TextQueryValue;
