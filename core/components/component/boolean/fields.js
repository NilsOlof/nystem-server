import { Wrapper, ContentTypeRender } from "nystem-components";

const BooleanFields = ({ setValue, model, value, path = "" }) => {
  const { itemTrue, itemFalse, className } = model;

  return (
    <Wrapper
      className={className}
      onClick={model.noOnClick ? undefined : () => setValue(!value)}
    >
      <ContentTypeRender
        path={path.replace(model.id, "")}
        items={value ? itemTrue : itemFalse}
      />
    </Wrapper>
  );
};

export default BooleanFields;
