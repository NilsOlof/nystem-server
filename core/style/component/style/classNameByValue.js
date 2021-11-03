import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const getClasses = ({ classNameByValue, field, view }) => {
  const testValue = view.getValue(field);
  return classNameByValue.map(([key, value]) => key === testValue && value);
};

const StyleClassNameByValue = ({ model, path, view }) => {
  const { renderAs, item, mapper, className } = model;
  const add = mapper.map((value) => getClasses({ ...value, view }));

  return (
    <Wrapper className={[add, className]} renderAs={renderAs}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default StyleClassNameByValue;
