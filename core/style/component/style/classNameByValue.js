import { Wrapper, ContentTypeRender } from "nystem-components";

const compare = (val1, val2) => {
  if (val1 === "true") val1 = true;
  if (val1 === "false") val1 = false;
  if (val2 === "true") val2 = true;
  if (val2 === "false") val2 = false;
  if (val2 === "undefined") val2 = undefined;

  if (typeof val1 !== "number") return val1 === val2;
  if (val2[0] === "<") return parseInt(val2.substring(1), 10) > val1;
  if (val2[0] === ">") return parseInt(val2.substring(1), 10) < val1;
  return val1 === parseInt(val2, 10);
};

const getClasses = ({ classNameByValue, field, view }) =>
  classNameByValue.map(
    ([key, value]) => compare(view.getValue(field), key) && value
  );

const StyleClassNameByValue = ({ model, path, view }) => {
  const { renderAs, item, mapper, className, add2Model } = model;
  const add = mapper.map((value) => getClasses({ ...value, view }));

  if (add2Model)
    return (
      <ContentTypeRender
        path={path}
        items={item.map((item) => ({
          ...item,
          className: [item.className, add],
        }))}
      />
    );

  return (
    <Wrapper className={[add, className]} renderAs={renderAs}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default StyleClassNameByValue;
