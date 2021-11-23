import React from "react";
import app from "nystem";
import { Icon, Wrapper, Button } from "nystem-components";
import { withRouter } from "react-router";

const ViewButtonBack = ({ children, model, history, ...rest }) => {
  const { className, text, fwd, size, icon, btnType } = model || rest;

  if (icon)
    return (
      <Icon className={className} icon={icon} onClick={() => history.go(-1)} />
    );

  return (
    <Button
      size={size}
      type={btnType}
      className={className}
      onClick={() => history.go(fwd ? 1 : -1)}
    >
      <Icon icon={fwd ? "arrow-right" : "arrow-left"} className="w-6 h-6" />
      <Wrapper>{children || app().t(text)}</Wrapper>
    </Button>
  );
};

export default withRouter(ViewButtonBack);
