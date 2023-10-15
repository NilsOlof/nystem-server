import { useEffect, useContext } from "react";
import { PanelContext, UseLocation } from "nystem-components";

const useSearch = ({ useSearch }) => {
  const { pathname, search } = UseLocation();
  return useSearch ? search : pathname;
};

const BootstrapPanelOpenByPath = ({ model, path, view }) => {
  const { toggleExpand, expanded } = useContext(PanelContext);
  const pathname = useSearch(model);

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

    if (setExpanded && !expanded) toggleExpand();
    if (model.closeOnChange && !setExpanded && expanded) toggleExpand();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

export default BootstrapPanelOpenByPath;
