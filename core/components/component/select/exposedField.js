import React, { useEffect } from "react";
import { SelectInput, UseSearch, RouterUseQueryStore } from "nystem-components";

const SelectExposedField = ({ model, view }) => {
  const [value, setValue] = RouterUseQueryStore(model.saveId);
  UseSearch({ view, id: model.id, value, exact: model.exact });

  useEffect(() => {
    if (value && !model.option.map((option) => option._id).includes(value))
      setValue(false);
  }, [model.option, setValue, value]);

  return (
    <SelectInput
      model={{
        ...model,
        clearButton: true,
        selectAllOnFocus: true,
      }}
      value={value}
      setValue={setValue}
    />
  );
};
export default SelectExposedField;
