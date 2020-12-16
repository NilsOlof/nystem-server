import React from "react";
import { ContentTypeView, InputWrapper, Wrapper } from "nystem-components";

const ReferenceView = ({ model, view, value = [], path }) => {
  value = value instanceof Array ? value : [value];
  const { renderFormat, className, source, itemClassName } = model;

  const option = (item, index) => (
    <ContentTypeView
      key={item}
      contentType={source}
      baseView={view}
      format={renderFormat || "view"}
      id={item}
      params={view.params}
      className={itemClassName}
      onReference={(item) => view.event(item.event, { ...item, model, path })}
    />
  );

  if (model.wrapper)
    return <InputWrapper model={model}>{value.map(option)}</InputWrapper>;

  return <Wrapper className={className}>{value.map(option)}</Wrapper>;
};
export default ReferenceView;
