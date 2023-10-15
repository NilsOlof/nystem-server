import { Wrapper } from "nystem-components";
import app from "nystem";

const ViewTextView = ({ model }) => {
  const className = model.className ? model.className.join(" ") : "";
  return (
    <Wrapper className={className} renderAs={model.renderAs} translate="true">
      {app().t(model.text)}
    </Wrapper>
  );
};
export default ViewTextView;
