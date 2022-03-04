import React, { useEffect, useState } from "react";
import { SelectInput } from "nystem-components";
import app from "nystem";

const DevtoolsSelectContenttype = ({ model, view }) => {
  const [option, setOption] = useState();
  const [value, setValue] = useState();

  useEffect(() => {
    const onSearch = (query) => {
      console.log({ query });
    };
    view.on("search", onSearch);

    const getOptions = async () => {
      const { data } = await app().event("devtools", { path: "contentType" });
      setOption(Object.keys(data));
    };
    getOptions();

    const init = ({ init }) => {
      if (init) getOptions();
    };
    app().on("devtools", init);

    return () => {
      view.off("search", onSearch);
      app().off("devtools", init);
    };
  }, [view]);

  if (!option) return null;
  console.log({ value });
  return (
    <SelectInput
      model={{ ...model, option }}
      value={value}
      setValue={setValue}
    />
  );
};

export default DevtoolsSelectContenttype;
