import { useEffect, useContext, useState } from "react";
import { DatabaseSearchContext } from "nystem-components";

const DatabaseBaseViewSearch = ({ view }) => {
  const [baseFilter, setBaseFilter] = useState({});
  const { search } = useContext(DatabaseSearchContext);

  useEffect(() => {
    const updateSearch = ({ filter }) => {
      setBaseFilter(filter);
    };
    view.baseView.on("search", -100, updateSearch);
    return () => {
      view.baseView.off("search", updateSearch);
    };
  }, [view]);

  useEffect(() => {
    if (!search.contentType || search.filter) return;

    setTimeout(() => {
      view.baseView
        .event("getSearch")
        .then(({ filter }) => setBaseFilter(filter));
    }, 0);
  }, [search, view]);

  useEffect(() => {
    if (!baseFilter) return;

    const onSearch = (search) => ({ ...search, filter: baseFilter });

    view.on("setSearch", 10, onSearch);
    view.event("setSearch");
    return () => {
      view.off("setSearch", onSearch);
    };
  }, [baseFilter, view]);

  return null;
};

export default DatabaseBaseViewSearch;
