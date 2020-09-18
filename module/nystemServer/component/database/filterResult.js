import { useEffect } from "react";

const DatabaseFilterResult = ({ view, children }) => {
  useEffect(() => {
    const filterSearch = (query) => {
      const { data } = query;

      const definition = data
        .filter((item) => item.name === "definition")
        .map((item) => item.component);

      const viewFields = data
        .filter((item) => item.name === "view")
        .filter((item) => !definition.includes(item.component));

      query.data = viewFields;
    };

    view.on("search", filterSearch);
    return () => {
      view.off("search", filterSearch);
    };
  }, [view]);

  return children || null;
};

export default DatabaseFilterResult;
