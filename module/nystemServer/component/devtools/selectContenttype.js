import React, { useEffect, useState, useRef } from "react";
import { SelectInput, Wrapper } from "nystem-components";
import app from "nystem";

const DevtoolsSelectContenttype = ({ model, view }) => {
  const [option, setOption] = useState();
  const [searches, setSetsearches] = useState([]);
  const [value, setValue] = useState({});
  const valRef = useRef();
  valRef.current = value.id;
  const paramRef = useRef();
  paramRef.current = searches[value.index];

  useEffect(() => {
    const onSearch = async (query) => {
      if (!valRef.current) return;

      const filter = { ...(paramRef.current?.filter || {}) };
      filter.$and = [...(filter.$and || []), ...(query.filter?.$and || [])];

      const result = await app().event("devtools", {
        ...query,
        filter,
        path: `database.${valRef.current}`,
        event: "search",
        contentType: valRef.current,
        data: undefined,
      });

      return {
        ...query,
        data: result.data,
        total: result.total,
        searchTotal: result.searchTotal,
      };
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

    const onSave = async (query) => {
      if (!valRef.current) return;

      await app().event("devtools", {
        ...query,
        path: `database.${valRef.current}`,
        event: "save",
      });

      return { ...query, data: false };
    };
    app().database[view.contentType].on("save", onSave);

    const onDelete = async (query) => {
      if (!valRef.current) return;

      await app().event("devtools", {
        ...query,
        path: `database.${valRef.current}`,
        event: "delete",
      });

      return { ...query, data: false };
    };
    app().database[view.contentType].on("delete", onDelete);

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
      app().database[view.contentType].off("save", onSave);
      app().database[view.contentType].off("delete", onDelete);
      app().off("devtools", init);
    };
  }, [view]);

  useEffect(() => {
    let id = 0;
    let searches = [];
    setSetsearches(searches);

    view.event("setSearch");

    app()
      .event("devtools", { on: "search", path: `database.${value.id}` })
      .then(({ listenId }) => {
        id = listenId;
      });

    const onSearch = ({ query, listenId }) => {
      if (!query || id !== listenId || query.devtoolsId) return;

      const { sortby, filter, reverse } = query;
      if (
        searches.find(
          (search) =>
            JSON.stringify(search) ===
            JSON.stringify({ sortby, filter, reverse })
        )
      )
        return;

      searches = [{ sortby, filter, reverse }, ...searches].slice(0, 20);

      setSetsearches(searches);
    };
    app().on("devtools", onSearch);

    return () => {
      app().off("devtools", onSearch);
    };
  }, [value.id, view]);

  const at = searches[value.index];
  useEffect(() => {
    view.event("setSearch");
  }, [view, at]);

  if (!option) return null;

  return (
    <Wrapper>
      <SelectInput
        model={{ ...model, option }}
        value={value.id}
        setValue={(val) => setValue({ id: val })}
      />
      {value && (
        <SelectInput
          model={{
            ...model,
            text: "Searches",
            option: searches.map((item, index) => `0${index}`),
          }}
          value={`0${value.index}`}
          setValue={(index) =>
            setValue({ id: value.id, index: parseInt(index, 10) })
          }
        />
      )}
      {at !== undefined && JSON.stringify(at)}
    </Wrapper>
  );
};

export default DevtoolsSelectContenttype;
