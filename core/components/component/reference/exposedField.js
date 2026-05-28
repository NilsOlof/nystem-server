import { useState, useEffect } from "react";
import app from "nystem";
import { SelectExposedField } from "nystem-components";

const ReferenceExposedField = ({ model, view, path }) => {
  const [option, setOption] = useState();

  useEffect(() => {
    let product = false;

    const update = async () => {
      const filter = app.parseFilter(model.filter, view.getValue, path);
      if (product) {
        filter.$and = filter.$and || [];
        filter.$and.push({ _id: product });
      }

      const { data: option } = await app.database[model.source].search({
        filter,
        count: 2000,
        sortby: "name",
      });
      setOption(option);
    };

    const onSearch = ({ filter = {} }) => {
      product = false;
      if (filter.$and) {
        const item = filter.$and.find((item) => item.product);
        // eslint-disable-next-line prefer-destructuring
        if (item) product = item.product;
      }
      update();
    };
    if (model.excludeNotActive) view.on("setSearch", -200, onSearch);

    const timer = setTimeout(update, 100);
    return () => {
      if (model.excludeNotActive) view.off("setSearch", onSearch);
      clearTimeout(timer);
    };
  }, [model, path, view]);

  if (!option || option.length === 0) return null;

  const selectModel = app.clone(model);
  delete selectModel.source;
  delete selectModel.mandatory;

  selectModel.option = option.map((item) => ({
    ...item,
    text: item[model.textField || "name"],
  }));

  return <SelectExposedField model={selectModel} view={view} />;
};

export default ReferenceExposedField;
