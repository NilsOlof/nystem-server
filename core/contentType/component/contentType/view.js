import React, { useState, useEffect, useMemo, useRef } from "react";
import app from "nystem";
import {
  Loading,
  Wrapper,
  DatabaseGet,
  ContentTypeRender,
  DatabaseSearchContextProvider,
} from "nystem-components";
import { getDiff, applyDiff } from "recursive-diff";

import { ViewContextProvider } from "./context";
import "./view.css";

const setValueAtPath = ({ path, current, value }) => {
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
  console.log(out);
  return out;
};

const getId = ({ path, id }) => {
  if (path && id) return `${path}.${id}`;
  if (id) return id;
  return path;
};

const useValue = ({ view, propvalue }) => {
  const { id, contentType, noAutoUpdate } = view;

  const { loading, data, first } = DatabaseGet({
    contentType,
    id,
    noAutoUpdate,
  });
  const [viewValue, setViewValue] = useState(false);

  useEffect(() => {
    if (!view.on) return;

    const reload = () => setViewValue(firstData.current);

    view.on("reload", reload);
    return () => {
      view.off("reload", reload);
    };
  }, [view]);

  const firstData = useRef(false);
  useEffect(() => {
    if (!data || !first) return;
    firstData.current = data;
  }, [data, first]);

  const viewValueRef = useRef(false);
  useEffect(() => {
    if (!viewValueRef.current) return;
    const diff = getDiff(firstData.current, data);
    const res = applyDiff(viewValueRef.current, diff);

    setViewValue({ ...res });
  }, [data, view]);

  const value = viewValue || data || propvalue || {};
  viewValueRef.current = viewValue;

  view.getValue = (path) =>
    path ? path.split(".").reduce((val, key) => val && val[key], value) : value;

  view.setValue = useMemo(
    () => (props) => {
      const out = setViewValue(setValueAtPath({ ...props, current: value }));
      view.event("change", { value: out, oldValue: value });
      return out;
    },
    [value, view]
  );

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
        getId,
        id,
      },
      `view ${contentType} ${format}`
    );
  }, [id, baseView, contentType, format, viewModel]);

  const { model } = view;

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

  if (!renderAs) renderAs = !addForm ? undefined : "form";

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
