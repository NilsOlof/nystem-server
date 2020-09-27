import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const MultilinetextFields = ({ value, model, path }) => {
  if (!value) return null;
  const { limit, item, className } = model;

  value = value instanceof Array ? value : [value];
  if (limit) value = value.slice(0, limit);

  return (
    <Wrapper>
      {value.map((val, index) => (
        <Wrapper key={index} className={className}>
          <a href={`http://${val}`} rel="noopener noreferrer" target="_blank">
            <ContentTypeRender path={path} items={item} />
          </a>
        </Wrapper>
      ))}
    </Wrapper>
  );
};
export default MultilinetextFields;
