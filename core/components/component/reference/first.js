import React from "react";
import { ContentTypeView, InputWrapper, Wrapper } from "nystem-components";

const ReferenceFirst = ({ model, view, value = [] }) => {
  value = value instanceof Array ? value[0] : value;
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
      onReference={(item) => view.event(item.event, { ...item, model })}
    />
  );

  if (model.wrapper)
    return <InputWrapper model={model}>{option(value)}</InputWrapper>;

  return <Wrapper className={className}>{option(value)}</Wrapper>;
};
export default ReferenceFirst;
