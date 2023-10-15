import { useRef, useEffect } from "react";

const UseSearch = ({ view, id, value, exact = false }) => {
  const last = useRef(undefined);

  useEffect(() => {
    if (value === undefined && last.current === undefined) return;

    const setSearch = (query) => {
      query.filter = query.filter || {};
      query.filter.$and = query.filter.$and || [];
      const search = exact ? { __exact: true } : {};

      const fields = id instanceof Array ? id : [id];
      const val = value === "true" ? true : value === "false" ? false : value;
      fields.forEach((id) => {
        search[id] = val;
      });

      query.filter.$and.push(search);
    };
    if (value !== undefined) view.on("setSearch", setSearch);

    view.event("setSearch");

    last.current = value;
    return () => {
      if (value !== undefined) view.off("setSearch", setSearch);
    };
  }, [exact, id, value, view]);
};
export default UseSearch;
