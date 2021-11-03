import React, { useState, useEffect } from "react";
import app from "nystem";
import SearchContext from "./searchContext";

const DatabaseSearchContextProvider = ({ children, view }) => {
  const [search, setSearchState] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { contentType } = view;
    let search = {};
    let timer = false;
    let active = false;
    let mounted = true;

    const setSearchDebounce = async (newSearch) => {
      if (!mounted) return;
      if (!active) {
        setLoading(true);
        view.on("search", 200, doSearch);
        if (!newSearch.noAutoUpdate)
          app().database[contentType].on("update", -1000, setSearch);
        app().on(["login", "logout"], -1000, setSearch);
        active = true;
      }
      if (newSearch) search = { ...newSearch, isDirty: true };
      if (!timer && search.delay !== -1)
        timer = setTimeout(() => setSearch(), 0);
    };

    const setSearch = async () => {
      if (!mounted) return;
      timer = false;

      const searchResult = await view.event("search", {
        ...search,
        data: undefined,
      });
      setSearchState({ ...searchResult, isDirty: false });

      setLoading(false);
      return searchResult;
    };

    const getSearch = () => search;
    view.on("getSearch", getSearch);

    view.on("setSearch", -500, setSearchDebounce);

    const doSearch = (search) =>
      app().database[contentType].search({
        ...search,
        data: undefined,
      });

    return () => {
      mounted = false;
      view.off("setSearch", setSearchDebounce);

      if (active) {
        view.off("search", doSearch);
        app().database[contentType].off("update", setSearch);
        app().off(["login", "logout"], setSearch);
      }
      view.off("getSearch", getSearch);
    };
  }, [view]);

  return (
    <SearchContext.Provider value={{ loading, search }}>
      {children}
    </SearchContext.Provider>
  );
};
export default DatabaseSearchContextProvider;
