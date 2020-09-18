import { useEffect, useContext } from "react";
import { DatabaseSearchContext } from "nystem-components";
import app from "nystem";

const DatabaseSearch = ({ view, model, path, children }) => {
  const { exact, reversesortby: reverse, count, subView, filter } = model;
  let { sortby } = model;

  const { setSearch } = useContext(DatabaseSearchContext);

  useEffect(() => {
    const updateFilter = () => {
      if (!filter) return;

      const insertVal = (val) =>
        val.replace(/\{([a-z_.]+)\}/gim, (str, p1, offset, s) =>
          view.getValue(p1.replace("..", path))
        );

      options.filter = { $and: [] };
      for (const item in filter) {
        const oneFilter = {};
        const oneFilterIn = filter[item].and;
        for (const i in oneFilterIn)
          oneFilter[insertVal(oneFilterIn[i][0])] = insertVal(
            oneFilterIn[i][1]
          );
        options.filter.$and.push(oneFilter);
      }
    };

    const { contentType } = view;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    sortby = sortby instanceof Array ? sortby : sortby && [sortby];

    const options = {
      exact,
      sortby: sortby && sortby.map((item) => item.id),
      reverse,
      contentType,
      iiid: app().uuid(),
    };

    if (count) options.count = parseInt(count, 10);
    if (view.id && subView) options.database = view.id;

    updateFilter();
    setSearch(options);
  }, [count, exact, path, reverse, setSearch, sortby, subView, view]);

  return children || null;
};

export default DatabaseSearch;
