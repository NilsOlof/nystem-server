import { useEffect } from "react";
import app from "nystem";

const FloatSum = ({ view, setValue, model }) => {
  useEffect(() => {
    const setSum = async (query) => {
      let { data } = await app.database[view.contentType].search({
        ...query,
        count: 100000,
        position: 0,
      });
      if (!data) data = [];
      setValue(data.reduce((sum, item) => parseFloat(item[model.id]) + sum, 0));
    };
    view.on("search", -100, setSum);
    return () => {
      view.off("search", setSum);
    };
  }, [model.id, setValue, view]);

  return null;
};

export default FloatSum;
