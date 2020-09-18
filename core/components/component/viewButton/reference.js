import React from "react";
import app from "nystem";
import { Button, Wrapper, ContentTypeRender } from "nystem-components";

const ViewButtonReference = ({ model, view, path }) => {
  const { event, item, className } = model;

  if (item && item.length)
    return (
      <Wrapper
        className={className}
        onClick={() => view.event("reference", { event, value: view.value })}
      >
        <ContentTypeRender path={path} items={item} />
      </Wrapper>
    );

  return (
    <Button
      onClick={() => view.event("reference", { event, value: view.value })}
      className={className}
      type={model.btnType}
      size={model.btnSize}
    >
      {app().t(model.text)}
    </Button>
  );
};

export default ViewButtonReference;
