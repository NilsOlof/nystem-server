import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const MultilinetextView = ({ value, path, model, view }) => {
  if (!value) return null;

  value = value instanceof Array ? value : [value];
  const { className, id } = model;
  return (
    <Wrapper className={className}>
      {value.map((nul, index) => (
        <ContentTypeRender
          key={index}
          path={path.replace(new RegExp(`.?${id}$`, "i"), "")}
          items={
            app().replaceInModel({
              model,
              viewFormat: view.viewFormat,
              fn: ({ model: item }) =>
                item.id === id ? { ...item, id: `${item.id}.${index}` } : item,
            }).item
          }
        />
      ))}
    </Wrapper>
  );
};
export default MultilinetextView;
