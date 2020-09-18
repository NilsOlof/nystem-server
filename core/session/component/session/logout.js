import React from "react";
import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";
import { withRouter } from "react-router";

const SessionLogout = ({ children, model, history, path, ...props }) => {
  const { item, className, to } = model || props;
  return (
    <Wrapper
      className={className}
      onClick={(e) => {
        e.preventDefault();
        app().session.logout();
        if (!to) return;

        history.replace(to);
      }}
    >
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};

export default withRouter(SessionLogout);
