import { useContext } from "react";
import {
  Wrapper,
  ContentTypeRender,
  DatabaseSearchContext,
} from "nystem-components";

const getSearchText = ({ filter = {} }) =>
  ((filter.$and || []).find((item) => item.$all) || {}).$all;

const ViewListEmptySearchresult = ({ model, path }) => {
  const { search = {} } = useContext(DatabaseSearchContext);
  const { data } = search;
  const test = model.emptyData ? data && data.length : getSearchText(search);

  if ((!test && model.inverse) || (test && !model.inverse))
    return (
      <Wrapper className={model.className} renderAs={model.renderAs}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );

  return null;
};
export default ViewListEmptySearchresult;
