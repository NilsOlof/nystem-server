import { Button, ContentTypeRender, Wrapper } from "nystem-components";
import app from "nystem";

const ViewButtonSetValue = ({ model, view, path }) => {
  const value = view.getValue(model.field);

  const insertVal = (val) => {
    if (!val) return val;
    return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
      if (p1 === "_language") return app().settings.lang;
      if (p1.startsWith("query.")) {
        return (
          new URLSearchParams(window.location.search).get(
            p1.replace("query.", "")
          ) || ""
        );
      }
      if (p1 === "id") return view.id;
      if (p1.indexOf("baseView.") !== 0)
        return view.getValue(p1.replace("..", path));
      p1 = p1.replace("baseView.", "");
      return view.baseView.getValue(p1.replace("..", path));
    });
  };

  const modelValue =
    model.value && model.value.replace(/[0-9]/, "") === ""
      ? parseInt(model.value, 10)
      : insertVal(model.value);

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
