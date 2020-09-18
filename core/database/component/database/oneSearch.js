import { useState, useEffect, useCallback } from "react";
import app from "nystem";

const DatabaseOneSearch = ({ noAutoUpdate, contentType, search: inSearch }) => {
  const db = app().database[contentType];
  const searchString = JSON.stringify(inSearch);

  const [search, setSearchState] = useState(inSearch);
  const [loading, setLoading] = useState(false);

  const setSearch = useCallback(
    (search) => {
      setLoading(true);

      db.search({ ...search, data: undefined }).then((search) => {
        setSearchState(search);
        setLoading(false);
      });

      // if (!noAutoUpdate) db.on("update", setSearch);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db, searchString]
  );

  useEffect(() => {
    setSearch(inSearch);

    return () => {
      if (!noAutoUpdate) db.off("update", setSearch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noAutoUpdate, db, setSearch]);

  return { loading, search, setSearch };
};

export default DatabaseOneSearch;
