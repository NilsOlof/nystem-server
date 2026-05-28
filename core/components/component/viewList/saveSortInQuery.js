import { useEffect, useRef } from "react";
import { useRouterQueryStore } from "nystem-components";

const ViewListSaveSortInQuery = ({ model, view }) => {
  const [value, setValue] = useRouterQueryStore(model.saveId);
  const ref = useRef();
  ref.current = setValue;

  useEffect(() => {
    let defaultVal;
    // eslint-disable-next-line prefer-const
    let [val, reverse] = value ? value.split("!") : [];

    const setSearchDefault = (query) => {
      const { sortby } = query;

      if (!defaultVal) defaultVal = sortby;
      if (val && defaultVal === sortby) {
        query.sortby = val;
        query.reverse = reverse !== undefined;
      }
    };
    view.on("setSearch", 1, setSearchDefault);

    const setSearchQuery = (query) => {
      const { sortby, reverse } = query;

      if (sortby !== val) {
        val = undefined;
        let sort = defaultVal !== sortby ? sortby : undefined;
        if (reverse && sort) sort += "!";
        ref.current(sort);
      }
    };
    view.on("setSearch", -100, setSearchQuery);
    view.event("setSearch");

    return () => {
      view.off("setSearch", setSearchDefault);
      view.off("setSearch", setSearchQuery);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  return null;
};

export default ViewListSaveSortInQuery;
