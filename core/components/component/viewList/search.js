import { useEffect, useState } from "react";
import { TextInput, useSearch, useRouterQueryStore } from "nystem-components";

const searchFields = ["$all", "_id"];

const ViewListSearch = ({ model, view }) => {
  const [className, setClassName] = useState("");
  const [value, setValue] = useRouterQueryStore(model.saveId);

  useSearch({ view, id: model.includeId ? searchFields : "$all", value, exact: model.exact || undefined });

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
      model={{
        ...model,
        mandatory: false,
        clearButton: !model.noClearButton,
        classNameInput: [!model.noWrapper && "w-full", className, model.classNameInput],
        selectAllOnFocus: true,
        text: model.text || "Search",
      }}
      value={value}
      setValue={setValue}
    />
  );
};

export default ViewListSearch;
