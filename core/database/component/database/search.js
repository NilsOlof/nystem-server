import { useEffect } from "react";

const DatabaseSearch = ({ view, model, path, children }) => {
  const { exact, count, subView, filter } = model;

  let { sortby } = model;

  useEffect(() => {
    const reverse = [
      model.reversesortby,
      model.reversesortby2,
      model.reversesortby3,
    ];

    const getFilter = () => {
      const searchFilter = { $and: [] };
      if (!filter) return searchFilter;

      const insertVal = (val) =>
        val.replace(/\{([a-z_.]+)\}/gim, (str, p1, offset, s) =>
          view.getValue(p1.replace("..", path))
        );

      filter.forEach((ofilter) => {
        const oneFilter = {};
        ofilter.and.forEach((oneFilterIn) => {
          oneFilter[insertVal(oneFilterIn[0])] = insertVal(oneFilterIn[1]);
        });
        searchFilter.$and.push(oneFilter);
      });
      return searchFilter;
    };

    const { contentType } = view;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    sortby = sortby instanceof Array ? sortby : sortby && [sortby];

    const options = {
      position: 0,
      exact,
      sortby: sortby && sortby.map((item) => item.id),
      reverse,
      contentType,
      delay: model.button ? -1 : parseInt(model.delay, 10),
      noAutoUpdate: model.noAutoUpdate,
    };

    if (count) options.count = parseInt(count, 10);
    if (view.id && subView) options.database = view.id;

    let searchFilter = getFilter();
    const onChange = () => {
      const before = JSON.stringify(searchFilter);
      searchFilter = getFilter();
      if (before !== JSON.stringify(searchFilter)) view.event("setSearch");
    };

    const onSearch = () => ({ ...options, filter: getFilter() });
    view.on("setSearch", 1000, onSearch);
    view.on("change", -10, onChange);

    setTimeout(() => {
      view.event("setSearch", options);
    }, 0);
    return () => {
      view.off("setSearch", onSearch);
      view.off("change", -10, onChange);
    };
  }, [count, exact, path, sortby, subView, view]);

  return children || null;
};

export default DatabaseSearch;
