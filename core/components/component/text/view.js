import { Wrapper } from "nystem-components";

const TextView = ({ model, value }) =>
  model.hideIfEmpty && !value ? null : (
    <Wrapper
      className={model.className}
      renderAs={model.renderAs}
      translate={model.translate}
      title={
        model.title || model.fallback ? value || model.fallback : undefined
      }
    >
      {value || model.fallback}
    </Wrapper>
  );

export default TextView;
