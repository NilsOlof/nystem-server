import { useContext } from "react";
import { Icon, PanelContext } from "nystem-components";

const BootstrapPanelIcon = ({ model }) => {
  const { className, classNameOpen, iconOpen, iconClosed } = model;
  const { expanded } = useContext(PanelContext);

  return (
    <Icon
      icon={
        expanded ? iconOpen || "chevron-down" : iconClosed || "chevron-right"
      }
      className={[
        className || "pointer h-6 w-6 pl-0",
        expanded && classNameOpen,
      ]}
    />
  );
};
export default BootstrapPanelIcon;
