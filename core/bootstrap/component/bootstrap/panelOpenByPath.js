import { useEffect, useContext } from "react";
import { useLocation } from "react-router-dom";
import { PanelContext } from "nystem-components";

const BootstrapPanelOpenByPath = ({ model, path, view }) => {
  const { toggleExpand, expanded } = useContext(PanelContext);
  const { pathname } = useLocation();

  useEffect(() => {
    const insertVal = (val) =>
      val &&
      val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) =>
        /pathItem[0-9]/.test(p1) && view.params
          ? view.params[p1[8]]
          : view.getValue(p1.replace("..", path))
      );

    let setExpanded = pathname.match(new RegExp(insertVal(model.match)));
    if (model.invert) setExpanded = !setExpanded;

    if (setExpanded && !expanded) toggleExpand(setExpanded);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

export default BootstrapPanelOpenByPath;
