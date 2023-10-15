import { useEffect } from "react";
import { SelectInput, UseSearch, RouterUseQueryStore } from "nystem-components";

const SelectExposedField = ({ model, view }) => {
  const [val, setValue] = RouterUseQueryStore(model.saveId);
  const value =
    val || (model.fallback === "false" ? false : model.fallback || undefined);

  UseSearch({ view, id: model.id, value, exact: model.exact });

  useEffect(() => {
    if (val && !model.option.map((option) => option._id).includes(val))
      setValue(false);
  }, [model.option, setValue, val]);

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
