import { useEffect } from "react";

const ViewButtonSetValueOnLoad = ({ model, view }) => {
  useEffect(() => {
    const value = view.getValue(model.field);
    const modelValue =
      model.value.replace(/[0-9]/, "") === ""
        ? parseInt(model.value, 10)
        : model.value;

    if (value !== modelValue)
      view.setValue({ path: model.field, value: modelValue });
  }, [model, view]);

  return null;
};

export default ViewButtonSetValueOnLoad;
