import { useRef, useEffect } from "react";

const UseSearch = ({ view, id, value, exact = false }) => {
  const last = useRef(false);

  useEffect(() => {
    if (!value && !last.current) return;

    const setSearch = (query) => {
      query.filter = query.filter || {};
      query.filter.$and = query.filter.$and || [];
      const search = exact ? { [id]: value, __exact: true } : { [id]: value };
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
