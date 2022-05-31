import { useEffect } from "react";
import app from "nystem";

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
        val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
          let val = "";
          if (p1 === "_language") val = app().settings.lang;
          else if (p1 === "id") val = view.id;
          else if (p1.indexOf("params.") === 0)
            val = view.params[p1.replace("params.", "")];
          else if (p1.indexOf("baseView.") !== 0)
            val = view.getValue(p1.replace("..", path));
          else {
            p1 = p1.replace("baseView.", "");
            if (p1.startsWith("baseView.")) {
              p1 = p1.replace("baseView.", "");
              val = view.baseView.baseView.getValue(p1.replace("..", path));
            } else val = view.baseView.getValue(p1.replace("..", path));
          }
          if (val instanceof Array) val = val.join("|");
          return val || "";
        });

      filter.forEach((ofilter) => {
        const oneFilter = {};

        ofilter.and.forEach((oneFilterIn) => {
          let val = insertVal(oneFilterIn[1]);

          if (val.startsWith("<="))
            val = `<${parseInt(val.substring(2), 10) + 1}`;

          if (val.startsWith(">="))
            val = `>${parseInt(val.substring(2), 10) - 1}`;

          if (val === "true") val = true;
          if (val === "false") val = false;

          oneFilter[insertVal(oneFilterIn[0])] = val;
        });

        if (ofilter.exact) oneFilter.__exact = true;

        if (
          !ofilter.removeifempty ||
          Object.values(oneFilter).find((val) => val)
        )
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
    view.on("change", -1000, onChange);

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
