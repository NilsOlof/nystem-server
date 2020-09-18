import { useEffect, useContext } from "react";
import { DatabaseSearchContext } from "nystem-components";

const DatabaseBaseViewSearch = ({ view }) => {
  const { setSearch, search } = useContext(DatabaseSearchContext);

  useEffect(() => {
    const updateSearch = ({ filter }) => {
      if (filter) setSearch({ ...search, filter });
    };
    view.baseView.on("search", updateSearch);
    return () => {
      view.baseView.off("search", updateSearch);
    };
  }, [view.baseView, search, setSearch]);

  useEffect(() => {
    if (!search.contentType || search.filter) return;

    const updateSearch = ({ filter }) => {
      if (filter) setSearch({ ...search, filter });
    };
    setTimeout(() => {
      view.baseView.event("getSearch").then(updateSearch);
    }, 0);
  }, [view.baseView, search, setSearch]);

  return null;
};

export default DatabaseBaseViewSearch;
