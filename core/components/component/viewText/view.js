import { Wrapper } from "nystem-components";
import app from "nystem";

const ViewTextView = ({ model }) => (
  <Wrapper
    className={model.className}
    renderAs={model.renderAs}
    translate="true"
  >
    {app.t(model.text)}
  </Wrapper>
);

export default ViewTextView;
