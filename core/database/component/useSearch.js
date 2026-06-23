import { useRef, useEffect } from "react";

const useSearch = ({ view, id, value, exact = false }) => {
  const last = useRef(undefined);

  useEffect(() => {
    const searchValue = value === "" ? undefined : value;

    if (searchValue === undefined && last.current === undefined) return;

    const setSearch = (query) => {
      query.filter = query.filter || {};
      query.filter.$and = query.filter.$and || [];
      const search = exact ? { __exact: true } : {};

      if (id === undefined) return;
      const fields = id instanceof Array ? id : [id];
      const val =
        searchValue === "true"
          ? true
          : searchValue === "false"
            ? false
            : searchValue;
      fields.forEach((id) => {
        search[id] = val;
      });

      query.filter.$and.push(search);
    };
    if (searchValue !== undefined) view.on("setSearch", setSearch);

    view.event("setSearch");

    last.current = searchValue;
    return () => {
      if (searchValue !== undefined) view.off("setSearch", setSearch);
    };
  }, [exact, id, value, view]);
};
export default useSearch;
