import React, { useEffect, useState, useRef } from "react";
import { SelectInput } from "nystem-components";
import app from "nystem";

const DevtoolsSelectContenttype = ({ model, view }) => {
  const [option, setOption] = useState();
  const [value, setValue] = useState();
  const valRef = useRef();
  valRef.current = value;

  useEffect(() => {
    const onSearch = async (query) => {
      if (!valRef.current) return;

      const result = await app().event("devtools", {
        ...query,
        path: `database.${valRef.current}`,
        event: "search",
        contentType: valRef.current,
        data: undefined,
      });

      return { ...query, data: result.data };
    };
    app().database[view.contentType].on("search", onSearch);

    const onGet = async (query) => {
      if (!valRef.current) return;

      const result = await app().event("devtools", {
        ...query,
        path: `database.${valRef.current}`,
        event: "get",
        contentType: valRef.current,
        data: undefined,
      });

      return { ...query, data: result.data };
    };
    app().database[view.contentType].on("get", onGet);

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
      app().database[view.contentType].off("get", onGet);
      app().database[view.contentType].off("search", onSearch);
      app().off("devtools", init);
    };
  }, [view]);

  useEffect(() => {
    view.event("setSearch");
  }, [value, view]);

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
