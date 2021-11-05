import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const isset = (val) => !!val && !(val instanceof Array && val.length === 0);
const isSetRecursive = (value) => {
  if (typeof value === "object")
    return Object.values(value)
      .map((value) => isSetRecursive(value))
      .filter((val) => val).length;

  return isset(value);
};

const ConditionalEmpty = ({ model, path, view }) => {
  const { className, renderAs, item, invert, checkId } = model;

  const empty = !isSetRecursive(view.getValue(checkId));

  if ((empty && !invert) || (!empty && invert))
    return (
      <Wrapper className={className} renderAs={renderAs}>
        <ContentTypeRender path={path} items={item} />
      </Wrapper>
    );

  return null;
};
export default ConditionalEmpty;
