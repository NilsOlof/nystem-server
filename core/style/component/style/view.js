import { Wrapper, ContentTypeRender } from "nystem-components";

const StyleView = ({ model, path }) => {
  const { className, renderAs, item } = model;

  return (
    <Wrapper className={className} renderAs={renderAs}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};

export default StyleView;
