import { useState, useEffect } from "react";
import app from "nystem";
import { SelectInput } from "nystem-components";

const ReferenceSelect = ({ model, setValue, value, view, path }) => {
  const [option, setOption] = useState([]);

  useEffect(() => {
    const loadOption = ({ connected }) => {
      if (!connected) return;

      const namefield = model.namefield ? model.namefield : "name";
      app()
        .database[model.source].search({
          filter: app().parseFilter(model.filter, view.getValue, path),
          count: 100,
        })
        .then(({ data }) => {
          app().connection.on("connection", loadOption);

          setOption(
            data
              ? data.map((item) => ({ _id: item._id, text: item[namefield] }))
              : []
          );
        });
    };
    loadOption({ connected: true });
    return () => {
      app().connection.off("connection", loadOption);
    };
  }, [model, path, view]);

  if (!value) value = [];
  if (!(value instanceof Array)) value = [value];

  return (
    <SelectInput
      view={view}
      model={{ ...model, option }}
      setValue={setValue}
      value={value}
    />
  );
};

export default ReferenceSelect;
// 57 40 35
