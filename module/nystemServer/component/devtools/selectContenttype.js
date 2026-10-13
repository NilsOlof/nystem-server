import React, { useEffect, useState, useRef } from "react";
import { SelectInput, Wrapper } from "nystem-components";
import app from "nystem";

const DevtoolsSelectContenttype = ({ model, view }) => {
  const [option, setOption] = useState();
  const [searches, setSearches] = useState([]);
  const [value, setValue] = useState({});
  const valRef = useRef();
  valRef.current = value.id;
  const paramRef = useRef();
  paramRef.current = value.search;

  useEffect(() => {
    const onSearch = async (query) => {
      if (!valRef.current) return;

      const filter = { ...(paramRef.current?.filter || {}) };
      filter.$and = [...(filter.$and || []), ...(query.filter?.$and || [])];

      const result = await app.event("devtools", {
        ...query,
        ...(paramRef.current ? { sortby: paramRef.current.sortby, reverse: paramRef.current.reverse } : {}),
        filter,
        path: `database.${valRef.current}`,
        event: "search",
        contentType: valRef.current,
        data: undefined,
      });

      return { ...query, data: result.data, total: result.total, searchTotal: result.searchTotal };
    };
    app.database[view.contentType].on("search", onSearch);

    const onGet = async (query) => {
      if (!valRef.current) return;

      const result = await app.event("devtools", {
        ...query,
        path: `database.${valRef.current}`,
        event: "get",
        contentType: valRef.current,
        data: undefined,
      });

      return { ...query, data: result.data };
    };
    app.database[view.contentType].on("get", onGet);

    const onSave = async (query) => {
      if (!valRef.current) return;

      const { data, error } = await app.event("devtools", {
        ...query,
        path: `database.${valRef.current}`,
        event: "save",
      });

      return { ...query, data, error };
    };
    app.database[view.contentType].on("save", onSave);

    const onDelete = async (query) => {
      if (!valRef.current) return;

      await app.event("devtools", { ...query, path: `database.${valRef.current}`, event: "delete" });

      return { ...query, data: false };
    };
    app.database[view.contentType].on("delete", onDelete);

    const getOptions = async () => {
      const { data } = await app.event("devtools", { path: "contentType" });
      if (!data) return;

      setOption(Object.keys(data));
    };
    getOptions();

    const init = ({ init }) => {
      if (init) getOptions();
    };
    app.on("devtools", init);

    return () => {
      app.database[view.contentType].off("get", onGet);
      app.database[view.contentType].off("search", onSearch);
      app.database[view.contentType].off("save", onSave);
      app.database[view.contentType].off("delete", onDelete);
      app.off("devtools", init);
    };
  }, [view]);

  useEffect(() => {
    setSearches([]);
    view.event("setSearch");
    if (!value.id) return;

    let listnerId;
    let mounted = true;
    let searches = [];

    app.event("devtools", { on: "search", path: `database.${value.id}` }).then((result) => {
      listnerId = result.data?.listnerId;
      if (!mounted && listnerId) app.event("devtools", { off: "search", path: `database.${value.id}`, listnerId });
    });

    const onSearch = (message) => {
      const { query } = message;
      if (!query || message.listnerId !== listnerId || query.devtoolsId) return;

      const { sortby, filter, reverse } = query;
      if (searches.find((search) => JSON.stringify(search) === JSON.stringify({ sortby, filter, reverse }))) return;

      searches = [{ sortby, filter, reverse }, ...searches].slice(0, 20);
      setSearches(searches);
    };
    app.on("devtools", onSearch);

    return () => {
      mounted = false;
      app.off("devtools", onSearch);
      if (listnerId) app.event("devtools", { off: "search", path: `database.${value.id}`, listnerId });
    };
  }, [value.id, view]);

  const at = value.search;
  useEffect(() => {
    view.event("setSearch");
  }, [view, at]);

  if (!option) return null;

  return (
    <Wrapper>
      <SelectInput model={{ ...model, option }} value={value.id} setValue={(val) => setValue({ id: val })} />
      {searches.length > 0 && (
        <SelectInput
          model={{ ...model, text: "Searches", option: searches.map((item, index) => `0${index}`) }}
          value={at ? `0${searches.indexOf(at)}` : undefined}
          setValue={(index) => setValue({ id: value.id, search: searches[parseInt(index, 10)] })}
        />
      )}
      {at !== undefined && JSON.stringify(at)}
    </Wrapper>
  );
};

export default DevtoolsSelectContenttype;
