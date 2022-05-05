import React, { useContext } from "react";
import { Icon, PanelContext } from "nystem-components";

const BootstrapPanelIcon = ({ model }) => {
  const { className, iconOpen, iconClosed } = model;
  const { expanded } = useContext(PanelContext);

  return (
    <Icon
      icon={
        expanded ? iconOpen || "chevron-down" : iconClosed || "chevron-right"
      }
      className={className || "pointer h-6 w-6 pl-0"}
    />
  );
};
export default BootstrapPanelIcon;
