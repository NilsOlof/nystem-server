import React from "react";
import { Icon } from "nystem-components";

const BooleanView = ({ model, value }) =>
  value ? <Icon className={model.className} type="checkmark" /> : null;

export default BooleanView;
