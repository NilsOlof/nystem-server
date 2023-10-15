import { useContext } from "react";
import { ContentTypeRender, DatabaseSearchContext } from "nystem-components";

const DatabaseMissing = ({ model, path }) => {
  const { search } = useContext(DatabaseSearchContext);

  if ((!search.data && !model.inverse) || (search.data && model.inverse))
    return <ContentTypeRender path={path} items={model.item} />;
  return null;
};
export default DatabaseMissing;
