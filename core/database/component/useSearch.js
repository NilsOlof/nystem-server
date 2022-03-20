import { useRef, useEffect } from "react";

const UseSearch = ({ view, id, value, exact = false }) => {
  const last = useRef(false);

  useEffect(() => {
    if (!value && !last.current) return;

    const setSearch = (query) => {
      query.filter = query.filter || {};
      query.filter.$and = query.filter.$and || [];
      const ids = id instanceof Array ? id : [id];

      const search = ids.reduce(
        (res, id) => ({ ...res, [id]: value }),
        exact ? { __exact: true } : {}
      );
      query.filter.$and.push(search);
    };
    if (value) view.on("setSearch", setSearch);
    view.event("setSearch");

    last.current = value;
    return () => {
      if (value) view.off("setSearch", setSearch);
    };
  }, [exact, id, value, view]);
};
export default UseSearch;
