import { useEffect, useState } from "react";
import { TextInput, UseSearch, RouterUseQueryStore } from "nystem-components";

const TextExposedField = ({ model, view }) => {
  const [className, setClassName] = useState("");
  const [value, setValue, ref] = RouterUseQueryStore(model.saveId);
  UseSearch({ view, id: model.id, value, exact: model.exact || undefined });

  useEffect(() => {
    if (!value) {
      setClassName("");
      return;
    }

    setClassName("border-orange-300 outline-none");

    let timer = setTimeout(() => {
      setClassName("border-green-500 outline-none");
      timer = setTimeout(() => {
        timer = false;
        setClassName("");
      }, 500);
    }, 200);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [value]);

  return (
    <TextInput
      ref={ref}
      model={{
        ...model,
        mandatory: false,
        clearButton: !model.noClearButton,
        classNameInput: [
          !model.noWrapper && "w-full",
          className,
          model.classNameInput,
        ],
        selectAllOnFocus: true,
      }}
      value={value}
      setValue={setValue}
    />
  );
};

export default TextExposedField;
