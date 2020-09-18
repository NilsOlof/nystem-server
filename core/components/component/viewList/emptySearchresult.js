import React, { useContext } from "react";
import {
  Wrapper,
  ContentTypeRender,
  DatabaseSearchContext,
} from "nystem-components";

const ViewListEmptySearchresult = ({ model, path }) => {
  const { search = {} } = useContext(DatabaseSearchContext);
  const { filter = {} } = search;
  const searchText = ((filter.$and || []).find((item) => item.$all) || {}).$all;

  if ((!searchText && model.inverse) || (searchText && !model.inverse))
    return (
      <Wrapper className={model.className} renderAs={model.renderAs}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );

  return null;
};
export default ViewListEmptySearchresult;
