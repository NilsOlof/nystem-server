import React from "react";
import { Icon } from "nystem-components";

const IconView = ({ model }) => (
  <Icon
    className={model.className}
    icon={model.icon}
    deg={model.deg !== "0" && model.deg}
  />
);

export default IconView;
