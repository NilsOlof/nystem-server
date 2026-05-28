import { Wrapper } from "nystem-components";

const ViewTextBreak = ({ model }) => {
  const className = model.className ? model.className.join(" ") : "";
  return (
    <Wrapper className={className} renderAs={model.renderAs} translate="true">
      <br />
    </Wrapper>
  );
};
export default ViewTextBreak;
