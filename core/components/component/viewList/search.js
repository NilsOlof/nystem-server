import { useEffect, useState } from "react";
import { TextInput, UseSearch, RouterUseQueryStore } from "nystem-components";

const ViewListSearch = ({ model, view }) => {
  const [className, setClassName] = useState("");
  const [value, setValue, ref] = RouterUseQueryStore(model.saveId);

  const idVal = model.includeId ? ["$all", "_id"] : "$all";
  UseSearch({ view, id: idVal, value, exact: model.exact || undefined });

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
        text: model.text || "Search",
      }}
      value={value}
      setValue={setValue}
    />
  );
};

export default ViewListSearch;
