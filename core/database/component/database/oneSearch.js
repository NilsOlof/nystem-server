import { useState, useEffect, useCallback } from "react";
import app from "nystem";

const DatabaseOneSearch = ({ noAutoUpdate, contentType, search: inSearch }) => {
  const db = app().database[contentType];
  const searchString = JSON.stringify(inSearch);

  const [search, setSearchState] = useState(inSearch);
  const [loading, setLoading] = useState(false);

  const setSearch = useCallback(
    (search, loading) => {
      if (loading) setLoading(true);

      db.search({ ...search, data: undefined }).then((search) => {
        setSearchState(search);
        if (loading) setLoading(false);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, searchString]
  );

  useEffect(() => {
    setSearch(inSearch, true);
    if (!noAutoUpdate) db.on("update", () => setSearch(search));
    return () => {
      if (!noAutoUpdate) db.off("update", setSearch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noAutoUpdate, db, setSearch]);

  return { loading, search, setSearch };
};

export default DatabaseOneSearch;
