import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const StyleEventOutside = ({ model, path, view, value }) => {
  const { className, classNameInner, item, event } = model;
  let innerClicked = false;
  return (
    <Wrapper
      className={className}
      onClick={() => {
        if (!innerClicked) view.event(event, value);
        innerClicked = false;
      }}
    >
      <Wrapper
        className={classNameInner}
        onClick={() => {
          innerClicked = true;
        }}
      >
        <ContentTypeRender path={path} items={item} />
      </Wrapper>
    </Wrapper>
  );
};

export default StyleEventOutside;
