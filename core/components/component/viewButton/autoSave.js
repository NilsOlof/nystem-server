import { useEffect } from "react";
import app from "nystem";

const ViewButtonAutoSave = ({ view, model }) => {
  const { delay = 200 } = model;

  useEffect(() => {
    let saveIds = [];
    let saveDelay = false;

    const saveToDb = async () => {
      const { errors = [] } = await view.event("validate");
      if ((!saveIds.length && view.value._id) || errors.length) return;

      const reduceById = (res, id) => ({ ...res, [id]: view.getValue(id) });

      const hasId = !!(view.value._id || view.id);

      const data = await app().database[view.contentType].save({
        data: hasId
          ? saveIds.reduce(reduceById, {
              _id: view.value._id || view.id,
            })
          : view.value,
        fields: hasId,
      });

      if (!view.value._id) await view.setValue({ path: "_id", value: data.id });

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

      saveDelay = setTimeout(saveToDb, delay);
    };
    if (!view.value._id && Object.keys(view.value).length)
      saveDelay = setTimeout(saveToDb, delay);

    view.on("change", -2100, handleChange);
    return () => {
      view.off("change", handleChange);
      if (saveDelay) clearTimeout(saveDelay);
    };
  }, [delay, view]);

  return null;
};
export default ViewButtonAutoSave;
