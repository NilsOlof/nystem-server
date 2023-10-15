import { Wrapper } from "nystem-components";

const MultilinetextCount = ({ model, value }) => {
  const { className, renderAs } = model;

  return (
    <Wrapper className={className} renderAs={renderAs}>
      {value ? value.length : model.fallback}
    </Wrapper>
  );
};
export default MultilinetextCount;
