import React, { useEffect, useState } from "react";
import { SelectInput, UseSearch, RouterUseQueryStore } from "nystem-components";

const SelectExposedField = ({ model, view }) => {
  const [className, setClassName] = useState("");
  const [value, setValue] = RouterUseQueryStore(model.saveId);
  UseSearch({ view, id: model.id, value });

  useEffect(() => {
    if (!value) return;
    setClassName("border-orange-300 outline-none");

    let timer = setTimeout(() => {
      setClassName("border-green-500 outline-none");
      timer = setTimeout(() => {
        timer = false;
        setClassName("");
      }, 1000);
    }, 200);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value]);

  return (
    <SelectInput
      model={{
        ...model,
        clearButton: true,
        classNameInput: `w-full ${className}`,
        selectAllOnFocus: true,
      }}
      value={value}
      setValue={setValue}
    />
  );
};
export default SelectExposedField;
