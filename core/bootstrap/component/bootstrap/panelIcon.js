import React, { useContext } from "react";
import { Icon, PanelContext } from "nystem-components";

const BootstrapPanelIcon = ({ model }) => {
  const { className, iconOpen, iconClosed } = model;
  const { expanded } = useContext(PanelContext);

  return (
    <Icon
      icon={
        expanded ? iconOpen || "cheveron-down" : iconClosed || "cheveron-right"
      }
      className={className || "w-6 h-6 pl-0 pointer"}
    />
  );
};
export default BootstrapPanelIcon;
