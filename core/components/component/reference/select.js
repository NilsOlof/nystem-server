import React, { useState, useEffect } from "react";
import app from "nystem";
import { SelectInput } from "nystem-components";

const ReferenceSelect = ({ model, setValue, value, view, path }) => {
  const [option, setOption] = useState([]);

  useEffect(() => {
    const loadOption = () => {
      const namefield = model.namefield ? model.namefield : "name";
      app()
        .database[model.source].search({
          autoUpdate: true,
          filter: app().parseFilter(model.filter, view.getValue, path),
          count: 100,
        })
        .then(({ data, offline }) => {
          if (offline) {
            app().connection.on("connect", loadOption);
            app().connection.on("connect", loadOption);
          } else app().connection.off("connect", loadOption);

          setOption(
            data.map((item) => ({ _id: item._id, text: item[namefield] }))
          );
        });
    };
    loadOption();
    return () => {
      app().connection.off("connect", loadOption);
    };
  }, [model, path, view]);

  if (!value) value = [];
  if (!(value instanceof Array)) value = [value];

  return (
    <SelectInput
      model={{ ...model, option }}
      setValue={setValue}
      value={value}
    />
  );
};

export default ReferenceSelect;
// 57 40 35
