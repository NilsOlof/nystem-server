import { useEffect } from "react";
import app from "nystem";

const IntSum = ({ view, setValue, model }) => {
  useEffect(() => {
    const setSum = (query) => {
      app.database[view.contentType]
        .search({
          filter: query.filter,
          count: 100000,
          position: 0,
        })
        .then(({ data }) => {
          if (!data) data = [];
          setValue(
            data.reduce(
              (sum, item) => parseInt(item[model.id] || 0, 10) + sum,
              0,
            ),
          );
        });
    };
    view.on("search", -100, setSum);
    return () => {
      view.off("search", setSum);
    };
  }, [model.id, setValue, view]);

  return null;
};

export default IntSum;
