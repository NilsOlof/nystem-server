import { useContext } from "react";
import {
  Wrapper,
  ContentTypeRender,
  DatabaseSearchContext,
} from "nystem-components";

const getSearchText = ({ filter = {} }) =>
  ((filter.$and || []).find((item) => item.$all) || {}).$all;

const ViewListEmptySearchresult = ({ model, path }) => {
  const { search = {}, data, ...rest } = useContext(DatabaseSearchContext);
  const test = model.emptyData ? data && data.length : getSearchText(search);
  console.log({ search, data, ...rest });
  if ((!test && model.inverse) || (test && !model.inverse))
    return (
      <Wrapper className={model.className} renderAs={model.renderAs}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );

  return null;
};
export default ViewListEmptySearchresult;
