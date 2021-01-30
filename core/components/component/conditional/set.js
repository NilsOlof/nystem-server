import { useEffect } from "react";

const isset = (val) => !!val && !(val instanceof Array && val.length === 0);

const ConditionalSet = ({ view, model, value, path }) => {
  useEffect(() => {
    const testCondition = (id, value) => {
      const val = view.getValue(id);
      if (value === "false") return !isset(val);
      if (value === "true") return isset(val);

      const reverse = value[0] === "!";
      if (reverse) value = value.substring(1);
      value = new RegExp(`^${value}$`, "i");
      if (value.test(val)) {
        if (!reverse) return true;
      } else if (reverse) return true;
    };

    const onChange = ({ id }) => {
      const { setId, condId, condVal } = model;
      let { setValue } = model;
      if (setValue === "false") setValue = false;
      if (setValue === "true") setValue = true;
      if (setValue === "undefined") setValue = undefined;

      if (
        id === condId &&
        testCondition(condId, condVal) &&
        view.getValue(setId) !== setValue
      )
        view.setValue({ path: setId, value: setValue });
    };

    view.on("change", -1000, onChange);
    return () => {
      view.off("change", onChange);
    };
  }, [model, value, view]);

  return null;
};

export default ConditionalSet;
