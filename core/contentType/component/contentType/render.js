import { createElement, useContext } from "react";
import app from "nystem";
import * as components from "nystem-components";

const createItem = ({ item, value, path, view, ...context }) => {
  const { capFirst } = app();
  const { id, type, format } = item;

  const componentName = `${capFirst(type)}${capFirst(
    format || view.viewFormat || "view"
  )}`;

  let component =
    components[componentName] || components[`${capFirst(type)}View`];

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
  if (typeof component === "object" && !component.render) {
    console.log(component, item);
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

  return items.map((item, key) => {
    const out = createItem({ key, item, path, ...context });
    return (renderAs && createElement(renderAs, { key }, out)) || out;
  });
};
export default ContentTypeRender;
