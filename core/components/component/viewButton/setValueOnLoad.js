import { useEffect } from "react";

const byType = {
  false: false,
  true: true,
  undefined: undefined,
};

const ViewButtonSetValueOnLoad = ({ model, view }) => {
  useEffect(() => {
    let value = view.getValue(model.field);

    if (model.value) {
      let modelValue =
        model.value.replace(/[0-9]/, "") === ""
          ? parseInt(model.value, 10)
          : model.value;

      if (byType.hasOwnProperty(modelValue)) modelValue = byType[modelValue];

      if (value !== modelValue)
        setTimeout(() => {
          view.setValue({ path: model.field, value: modelValue });
        }, 0);
    } else if (model.arrValue) {
      value = value || [];

      const modelValue = model.arrValue
        .map((val) =>
          val.replace(/[0-9]/, "") === "" ? parseInt(val, 10) : val
        )
        .map((val) => (byType.hasOwnProperty(val) ? byType[val] : val));

      const add = modelValue
        .filter((val) => val)
        .filter((val) => !value.includes(val));

      if (add.length)
        setTimeout(() => {
          view.setValue({ path: model.field, value: [...value, ...add] });
        }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, view.id]);

  return null;
};

export default ViewButtonSetValueOnLoad;
