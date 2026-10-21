import { useContext } from "react";
import { DatabaseSearchContext, ExtensionIcon } from "nystem-components";

const ViewListExtensionIcon = ({ model }) => {
  const { search } = useContext(DatabaseSearchContext);
  const value = search[model.field || "searchTotal"];
  const text = value == null || (model.clearOnZero && Number(value) === 0) ? "" : String(value);

  return <ExtensionIcon text={text} />;
};

export default ViewListExtensionIcon;
