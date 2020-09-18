import React, { useState, useEffect, useCallback } from "react";
import app from "nystem";
import SearchContext from "./searchContext";

const DatabaseSearchContextProvider = ({ children, view }) => {
  const [search, setSearchState] = useState({});
  const [loading, setLoading] = useState(false);
  const { contentType } = search;

  const setSearch = useCallback(
    async (search) => {
      const { contentType } = search;
      setLoading(true);
      const searchResult = await app().database[contentType].search({
        ...search,
        data: undefined,
      });

      view
        .event("search", searchResult)
        .then((searchResult) => setSearchState(searchResult));

      setLoading(false);

      return searchResult;
    },
    [view]
  );

  const setFilter = useCallback(
    async ({ value, modelId, id }) => {
      if (!Object.keys(search).length) return;

      const { filter = {} } = search;
      let { $and = [] } = filter;
      const old = ($and.find((obj) => obj.__id === id) || {})[modelId] || "";
      if (old === value) return;

      $and = $and.filter((obj) => obj.__id !== id);
      if (value !== undefined)
        $and.push({
          __id: id,
          [modelId]: value,
        });

      return setSearch({ ...search, filter: { ...filter, $and } });
    },
    [setSearch, search]
  );

  useEffect(() => {
    if (!contentType || search.noAutoUpdate) return;

    const doSearch = async () => {
      setLoading(true);

      const searchResult = await app().database[contentType].search({
        ...search,
        data: undefined,
      });

      view
        .event("search", searchResult)
        .then((searchResult) => setSearchState(searchResult));

      setLoading(false);
    };

    app().database[contentType].on("update", -1000, doSearch);
    app().on(["login", "logout"], -1000, doSearch);
    const getSearch = () => search;
    view.on("getSearch", getSearch);

    return () => {
      app().database[contentType].off("update", doSearch);
      app().off(["login", "logout"], doSearch);
      view.off("getSearch", getSearch);
    };
  }, [search, contentType, setSearch, view]);

  return (
    <SearchContext.Provider value={{ loading, search, setSearch, setFilter }}>
      {children}
    </SearchContext.Provider>
  );
};
export default DatabaseSearchContextProvider;
