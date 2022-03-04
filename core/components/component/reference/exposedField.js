import React, { useState, useEffect } from "react";
import app from "nystem";
import { SelectExposedField } from "nystem-components";

const ReferenceExposedField = ({ model, view, path }) => {
  const [option, setOption] = useState();

  useEffect(() => {
    const update = async () => {
      const { data: option } = await app().database[model.source].search({
        filter: app().parseFilter(model.filter, view.getValue, path),
        count: 2000,
      });
      setOption(option);
    };

    const timer = setTimeout(update, 100);
    return () => {
      clearTimeout(timer);
    };
  }, [model.filter, model.source, path, view.getValue]);

  if (!option || option.length === 0) return null;

  const selectModel = app().clone(model);
  delete selectModel.source;
  delete selectModel.mandatory;

  selectModel.option = option.map((item) => ({
    ...item,
    text: item[model.textField || "name"],
  }));

  return <SelectExposedField model={selectModel} view={view} />;
};

export default ReferenceExposedField;
