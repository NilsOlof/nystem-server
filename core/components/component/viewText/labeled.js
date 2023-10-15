import { InputWrapper, ContentTypeRender } from "nystem-components";

const ViewTextLabeled = ({ model, view, path }) => {
  const { item, fallback } = model;
  const val = view.getValue(item[0].id);

  return (
    <InputWrapper model={{ ...item[0], ...model }}>
      {val ? <ContentTypeRender path={path} items={item} /> : fallback}
    </InputWrapper>
  );
};
export default ViewTextLabeled;
