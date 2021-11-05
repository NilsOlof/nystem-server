import React from "react";
import { SelectInput, UseSearch, RouterUseQueryStore } from "nystem-components";

const BooleanExposedField = ({ model, view }) => {
  const [value, setValue] = RouterUseQueryStore(model.saveId);
  UseSearch({ view, id: model.id, value });
  const { hideTrue, trueText, hideFalse, falseText } = model;

  const option = [];

  if (!hideFalse)
    option.push({
      _id: "false",
      text: falseText || "False",
    });
  if (!hideTrue)
    option.push({
      _id: "true",
      text: trueText || "True",
    });

  return (
    <SelectInput
      view={view}
      model={{
        ...model,
        clearButton: true,
        selectAllOnFocus: true,
        option,
        limit: 1,
      }}
      value={value}
      setValue={setValue}
    />
  );
};
export default BooleanExposedField;
