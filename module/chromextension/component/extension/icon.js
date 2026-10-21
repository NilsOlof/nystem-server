import { useEffect } from "react";
import app from "nystem";

const ExtensionIcon = (props) => {
  const { color, text, icon, canvas } = props.model || props;
  useEffect(() => {
    const update = () => app.event("extensionIcon", { color, text, icon, canvas }).catch(console.error);
    app.on(["login", "logout"], update);
    update();
    return () => app.off(["login", "logout"], update);
  }, [color, text, icon, canvas]);
  return null;
};
export default ExtensionIcon;
