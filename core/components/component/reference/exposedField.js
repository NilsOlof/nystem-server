import React, { useState, useEffect } from "react";
import app from "nystem";
import { SelectExposedField } from "nystem-components";

const ReferenceExposedField = ({ model, view, path }) => {
  const [option, setOption] = useState();

  useEffect(() => {
    app()
      .database[model.source].search({
        autoUpdate: true,
        filter: app().parseFilter(model.filter, view.getValue, path),
        count: 100,
      })
      .then(({ data: option }) => setOption(option));
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
