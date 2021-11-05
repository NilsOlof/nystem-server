import React from "react";
import { TextView } from "nystem-components";
import app from "nystem";

function outputFloat({ value, model }) {
  if (!value || !model || !model.tofixed) return value;
  value = parseFloat(value).toFixed(model.tofixed);
  return app().settings.lang === "sv" ? value.replace(".", ",") : value;
}

const FloatView = (props) => <TextView {...props} value={outputFloat(props)} />;
export default FloatView;
