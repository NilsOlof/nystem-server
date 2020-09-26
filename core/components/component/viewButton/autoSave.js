import { useEffect } from "react";
import app from "nystem";

const ViewButtonAutoSave = ({ view }) => {
  useEffect(() => {
    let saveIds = [];
    let saveDelay = false;

    const saveToDb = async () => {
      const { errors } = await view.event("validate");
      if (!saveIds.length || errors) return;

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

    const handleChange = ({ id }) => {
      if (!id || id === "_id" || !view.value) return;

      if (saveIds.includes(id)) return;
      saveIds.push(id);

      saveDelay = setTimeout(saveToDb, 200);
    };

    view.on("change", handleChange);
    return () => {
      view.off("change", handleChange);
      if (saveDelay) clearTimeout(saveDelay);
    };
  }, []);

  return null;
};
export default ViewButtonAutoSave;
