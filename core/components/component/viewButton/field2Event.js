import { useState, useEffect, createElement } from "react";
import app from "nystem";
import * as components from "nystem-components";

const ViewButtonField2Event = ({ model, view }) => {
  const { capFirst } = app();

  const { type, format } = model.field[0];
  const [value, setValue] = useState(model.default);

  const componentName = `${capFirst(type)}${capFirst(
    format || view.viewFormat || "view"
  )}`;
  const component =
    components[componentName] || components[`${capFirst(type)}View`];

  useEffect(() => {
    view.event(model.event, { value });
  }, [model.event, value, view]);

  return createElement(component, {
    value,
    view,
    model: model.field[0],
    setValue,
  });
};
export default ViewButtonField2Event;
