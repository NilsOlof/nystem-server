import React from "react";
import app from "nystem";
import { Icon, Wrapper, Button } from "nystem-components";
import { withRouter } from "react-router";

const ViewButtonBack = ({ children, model, history }) => {
  model = model || {};
  const { className, renderAs, text } = model;

  if (children)
    return (
      <Wrapper
        className={className}
        onClick={() => history.go(-1)}
        renderAs={renderAs || "div"}
      >
        {children}
      </Wrapper>
    );

  if (model.icon)
    return (
      <Icon
        className={className}
        icon={model.icon}
        onClick={() => history.go(-1)}
      />
    );

  return (
    <Button className={className} onClick={() => history.go(-1)}>
      <Icon icon="arrow-left" className="w-6 h-6" />
      <Wrapper>{app().t(text)}</Wrapper>
    </Button>
  );
};

export default withRouter(ViewButtonBack);
