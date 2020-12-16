import { useEffect, useContext } from "react";
import { DatabaseSearchContext } from "nystem-components";

const DatabaseBaseViewSearch = ({ view }) => {
  const { search } = useContext(DatabaseSearchContext);

  useEffect(() => {
    const updateSearch = ({ filter }) => {
      if (filter) view.event("setSearch", { ...search, filter });
    };
    view.baseView.on("search", updateSearch);
    return () => {
      view.baseView.off("search", updateSearch);
    };
  }, [view.baseView, search, view]);

  useEffect(() => {
    if (!search.contentType || search.filter) return;

    const updateSearch = ({ filter }) => {
      if (filter) view.event("setSearch", { ...search, filter });
    };
    setTimeout(() => {
      view.baseView.event("getSearch").then(updateSearch);
    }, 0);
  }, [view.baseView, search, view]);

  return null;
};

export default DatabaseBaseViewSearch;
