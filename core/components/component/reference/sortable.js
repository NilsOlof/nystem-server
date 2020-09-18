import React from "react";
import {
  ContentTypeView,
  InputWrapper,
  Wrapper,
  DragAndDropView
} from "nystem-components";

const ReferenceSortable = ({ model, view, value = [], setValue }) => {
  value = value instanceof Array ? value : [value];
  const { renderFormat, className, source, itemClassName } = model;

  const option = item => ({
    key: item,
    noForm: true,
    contentType: source,
    baseView: view,
    format: renderFormat || "view",
    id: item,
    params: view.params,
    className: itemClassName,
    onReference: item => view.event(item.event, { ...item, model })
  });

  if (model.wrapper)
    return (
      <InputWrapper model={model}>
        <DragAndDropView
          Component={ContentTypeView}
          items={value.map(option)}
          setValue={setValue}
        />
      </InputWrapper>
    );

  return (
    <Wrapper className={className}>
      <DragAndDropView
        Component={ContentTypeView}
        items={value.map(option)}
        setValue={setValue}
      />
    </Wrapper>
  );
};
export default ReferenceSortable;
