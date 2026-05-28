import { createElement, useContext, Suspense } from "react";
import app from "nystem";
import * as components from "nystem-components";

const createItem = ({ item, value, path, view, ...context }) => {
  const { capFirst } = app;
  const { id, type, format } = item;

  const componentName = `${capFirst(type)}${capFirst(
    format || view.viewFormat || "view",
  )}`;

  let component =
    components[componentName] || components[`${capFirst(type)}View`];
  if (!view) return false;
  const { getValue, getValuePath } = view;
  const valuePath = getValuePath(path, id);
  const setValue = (value) => view.setValue({ path: valuePath, value });

  if (!component)
    return (
      <div
        key={context.key}
        className="red"
      >{`Missing component ${componentName}`}</div>
    );

  const focus =
    item.format === "input" &&
    item.category !== "view" &&
    view.focus &&
    !view.focused;

  if (focus) view.focused = true;
  if (
    !component.render &&
    !component._init &&
    typeof component !== "function"
  ) {
    console.log(component, typeof component, item);
    component = "div";
  }
  return createElement(component, {
    ...context,
    value: getValue(valuePath),
    path,
    view,
    model: item,
    setValue,
    focus,
  });
};

const ContentTypeRender = (props) => {
  const { path, items, renderAs } = props;
  const context = useContext(components.ContentTypeContext);

  if (!items) return <div className="red">Missing items</div>;
  return (
    <Suspense fallback={createElement(renderAs || "div", {}, "Loading...")}>
      {items.map((item, key) => {
        const out = createItem({ key, item, path, ...context });
        if (!out) return null;
        return (renderAs && createElement(renderAs, { key }, out)) || out;
      })}
    </Suspense>
  );
};
export default ContentTypeRender;
