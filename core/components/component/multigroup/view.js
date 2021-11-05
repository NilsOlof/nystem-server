import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const getId = (item, model) =>
  item.id.replace(new RegExp(`^${model.id}.`, "i"), "");

const MultigroupView = ({ value, view, model, path }) => {
  const { className, rowClassName } = model;

  value = value || [];
  if (model.limit) value = value.slice(0, model.limit);

  return (
    <Wrapper className={className}>
      {value.map((item, index) => (
        <Wrapper key={index} className={rowClassName}>
          <ContentTypeRender
            path={`${view.getValuePath(path, model.id)}.${index}`}
            items={
              app().replaceInModel({
                model,
                viewFormat: view.viewFormat,
                fn: ({ model: item }) =>
                  item.id && item.id.indexOf(model.id) === 0
                    ? { ...item, id: getId(item, model) }
                    : item,
              }).item
            }
          />
        </Wrapper>
      ))}
    </Wrapper>
  );
};
export default MultigroupView;
