import { useEffect } from "react";
import app from "nystem";

const ViewButtonAutoSave = ({ view }) => {
  useEffect(() => {
    let saveIds = [];
    let saveDelay = false;

    const saveToDb = async () => {
      const { errors = [] } = await view.event("validate");
      if (!saveIds.length || errors.length) return;

      const reduceById = (res, id) => ({ ...res, [id]: view.getValue(id) });

      const data = await app().database[view.contentType].save({
        data: saveIds.reduce(reduceById, {
          _id: view.value._id || view.id,
        }),
        fields: true,
      });

      if (!view.value._id) view.setValue({ path: "_id", value: data.id });

      view.event("save", view.value);

      saveIds = [];
    };

    const handleChange = ({ id, value }) => {
      if (id === "_id" || ((!value || value._id) && !id)) return;

      if (!id) saveIds = Object.keys(value);
      else {
        [id] = id.split(".");

        if (saveIds.includes(id)) return;
        saveIds.push(id);
      }

      saveDelay = setTimeout(saveToDb, 200);
    };

    view.on("change", -2100, handleChange);
    return () => {
      view.off("change", handleChange);
      if (saveDelay) clearTimeout(saveDelay);
    };
  }, [view]);

  return null;
};
export default ViewButtonAutoSave;
