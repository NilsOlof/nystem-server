import { useEffect, useContext } from "react";
import { PanelContext } from "nystem-components";

const BootstrapPanelOpenByValue = ({ model, view, path }) => {
  const { toggleExpand, expanded } = useContext(PanelContext);

  useEffect(() => {
    const value = view.getValue(path);

    if (model.keyCount || model.keyCount === 0) {
      let setExpanded =
        Object.keys(view.getValue(path)).length > model.keyCount;
      if (model.invert) setExpanded = !setExpanded;

      if (setExpanded && !expanded) toggleExpand(setExpanded);
    } else {
      const [[key, val]] = model.condition;
      let setExpanded = value[key] === val;
      if (val === "false") setExpanded = !val;
      else if (val === "true") setExpanded = !!val;

      if (model.invert) setExpanded = !setExpanded;

      if (setExpanded && !expanded) toggleExpand(setExpanded);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  return null;
};

export default BootstrapPanelOpenByValue;
