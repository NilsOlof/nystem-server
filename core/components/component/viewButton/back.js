import React from "react";
import app from "nystem";
import { Icon, Wrapper, Button } from "nystem-components";
import { withRouter } from "react-router";

const ViewButtonBack = ({ children, model, history }) => {
  model = model || {};
  const { className, text } = model;

  if (model.icon)
    return (
      <Icon
        className={className}
        icon={model.icon}
        onClick={() => history.go(-1)}
      />
    );

  return (
    <Button type="primary" className={className} onClick={() => history.go(-1)}>
      <Icon icon="arrow-left" className="w-6 h-6" />
      <Wrapper>{children || app().t(text)}</Wrapper>
    </Button>
  );
};

export default withRouter(ViewButtonBack);
