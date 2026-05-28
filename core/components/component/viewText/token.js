import { useState, useEffect, useCallback } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const ViewTextToken = ({ model = {}, view, path }) => {
  const insertVal = useCallback(
    (val) => {
      if (!val) return val;

      return val.replace(/\{([a-z_.]+)\}/gim, (str, p1) => {
        const resolvedPath = p1.replace("..", path);
        const v = view.getValue(resolvedPath);
        return typeof v === "undefined" ? "" : v;
      });
    },
    [view, path],
  );

  const [state, setState] = useState(() => ({
    value: app.clone(view.value),
    text: insertVal(model.text),
  }));

  useEffect(() => {
    const handler = () => {
      if (JSON.stringify(view.value) !== JSON.stringify(state.value)) {
        setTimeout(() => {
          setState({
            value: app.clone(view.value),
            text: insertVal(model.text),
          });
        }, 0);
      }
    };

    view.on("change", handler);
    return () => {
      view.off("change", handler);
    };
  }, [view, state.value, model.text, insertVal]);

  const className = model.className ? model.className.join(" ") : "";
  const renderAs = model.renderAs ? model.renderAs : model.format;

  return (
    <Wrapper renderAs={renderAs} className={className}>
      {app.t(state.text)}
    </Wrapper>
  );
};

export default ViewTextToken;
