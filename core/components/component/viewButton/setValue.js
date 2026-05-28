import { Button, ContentTypeRender, Wrapper } from "nystem-components";
import app from "nystem";

const ViewButtonSetValue = ({ model, view, path }) => {
  const value = view.getValue(model.field);

  let modelValue =
    model.value && model.value.replace(/[0-9]/, "") === ""
      ? parseInt(model.value, 10)
      : app.insertVal(model.value, view, path);

  if (modelValue === "false") modelValue = false;
  if (modelValue === "undefined") modelValue = undefined;

  const setValue = () =>
    view.setValue({ path: model.field, value: modelValue });

  if (model.item?.length)
    return (
      <Wrapper className={model.className} onClick={() => setValue()}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );

  return (
    <Button
      type={value === modelValue ? model.btnType : model.falseBtnType}
      size={model.size}
      className={model.className}
      onClick={() => setValue()}
    >
      {value ? model.text : model.falseText || model.text}
    </Button>
  );
};

export default ViewButtonSetValue;
