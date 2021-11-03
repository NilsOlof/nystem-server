import React, { useState, useEffect, useMemo } from "react";
import app from "nystem";
import {
  Loading,
  Wrapper,
  ContentTypeRender,
  DatabaseSearchContextProvider,
} from "nystem-components";
import { getDiff, applyDiff } from "recursive-diff";

import { ViewContextProvider } from "./context";
import "./view.css";

const setValueAtPath = ({ path, current, value }) => {
  if (!path) return value;

  const parts = path.split(".");
  const out = { ...current };
  let at = out;

  parts.forEach((key, index) => {
    if (parts.length - 1 === index) at[key] = value;
    else {
      at[key] = at[key] instanceof Array ? [...at[key]] : { ...at[key] };
      at = at[key];
    }
  });

  if (app().settings.debug) console.log(out);
  return out;
};

const getValuePath = (path = "", id = "") => {
  if (id) {
    id = id.substring(id.lastIndexOf(".") + 1);
    return path ? `${path}.${id}` : id;
  }
  return path;
};

const useValue = ({ view, propvalue }) => {
  const [value, setValue] = useState({});
  const [loading, setLoading] = useState(!!view.id);

  useEffect(() => {
    if (!propvalue || view.id) return;
    setTimeout(() => {
      view.event("change", { value: propvalue });
    }, 10);
  }, [view, propvalue]);

  useEffect(() => {
    if (!view.on) return;

    const { id, contentType, noAutoUpdate } = view;
    const db = app().database[contentType];
    let firstData = id ? false : {};
    let value = false;
    let savedData = false;

    const doGet = ({ ids } = {}) => {
      if (!ids || ids.includes(id))
        db.get({ id }).then(({ data }) => {
          if (!data) data = {};
          if (!firstData) {
            view.event("change", { value: data });
            return;
          }

          const diff = getDiff(savedData, data);
          value = applyDiff(value, diff);

          if (diff.length) view.event("change", { value });
        });
    };
    if (id) {
      if (!db) console.error("Missing db", view);
      doGet();
      if (!noAutoUpdate) db.on("update", doGet);
    }

    const changeData = (props) => ({
      ...props,
      id: props.path,
      value: props.path
        ? setValueAtPath({ ...props, current: value })
        : props.value,
      oldValue: value,
    });

    view.on("change", 1000, changeData);

    const setData = async ({ value: newValue }) => {
      value = newValue;
      await setValue({ ...value });

      if (!firstData) {
        // eslint-disable-next-line no-multi-assign
        firstData = savedData = value;
        setLoading(false);
      }
    };
    view.on("change", -999, setData);

    const saveData = (data) => {
      savedData = data;
    };
    view.on("save", -1000, saveData);

    const reload = () => {
      view.event("clearErrorValidation");
      view.event("change", { value: firstData });
    };
    view.on("reload", reload);

    return () => {
      if (id && !noAutoUpdate) db.off("update", doGet);
      view.off("reload", reload);
      view.off("change", changeData);
      view.off("change", setData);
      view.on("save", saveData);
    };
  }, [view]);

  view.getValue = (path) =>
    path ? path.split(".").reduce((val, key) => val && val[key], value) : value;

  view.setValue = (props) => view.event("change", props);
  view.value = value;

  return { value, loading };
};

const ContentTypeView = ({
  id,
  contentType,
  baseView,
  addForm,
  className,
  itemFrom,
  itemTo,
  format,
  children,
  view: viewModel,
  value: propvalue,
  renderAs,
  itemRenderAs,
  params,
  ...events
}) => {
  const view = useMemo(() => {
    const model = app().populatedViews[contentType];

    if (!viewModel && !(model && model.views)) {
      console.error("View creation error", {
        contentType,
        baseView,
        format,
      });
      return { model: {} };
    }

    const base = viewModel || model.views[format] || {};
    return app().addeventhandler(
      {
        ...base,
        baseView,
        model,
        format,
        viewFormat: base.format,
        contentType,
        getValuePath,
        id,
      },
      `view ${contentType} ${format}`
    );
  }, [contentType, viewModel, format, baseView, id]);

  const { model } = view;
  view.params = params;

  useEffect(() => {
    if (!view.on) return;

    Object.keys(events).forEach((event) => {
      if (event.substring(0, 2) === "on" && event[2].toUpperCase() === event[2])
        view.on(event.substring(2).toLowerCase(), events[event]);
    });

    return () => {
      Object.keys(events).forEach((event) => {
        if (
          event.substring(0, 2) === "on" &&
          event[2].toUpperCase() === event[2]
        )
          view.off(event.substring(2).toLowerCase(), events[event]);
      });
    };
  }, [events, view]);

  const { value, loading } = useValue({ view, propvalue });

  if (!model) return "Missing model to create view";
  if (loading) return <Loading />;

  const context = { contentType, model, view, value };
  const items = view.item ? view.item.slice(itemFrom, itemTo) : [];

  if (!renderAs) renderAs = !(addForm || view.addForm) ? undefined : "form";

  return (
    <ViewContextProvider value={context}>
      <Wrapper
        renderAs={renderAs}
        className={className}
        {...(!addForm
          ? {}
          : {
              onSubmit: (e) => {
                e.preventDefault();
                view.event("submit");
              },
            })}
      >
        <DatabaseSearchContextProvider view={view}>
          {children || (
            <ContentTypeRender items={items} renderAs={itemRenderAs} />
          )}
        </DatabaseSearchContextProvider>
      </Wrapper>
    </ViewContextProvider>
  );
};

export default ContentTypeView;
