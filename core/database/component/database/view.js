import React, { useContext } from "react";
import { ContentTypeRender, DatabaseSearchContext } from "nystem-components";

const DatabaseView = ({ model, path }) => {
  const { search } = useContext(DatabaseSearchContext);

  if (search.data) return <ContentTypeRender path={path} items={model.item} />;
  return null;
};
export default DatabaseView;
