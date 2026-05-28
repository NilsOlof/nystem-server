import app from "nystem";
import { Wrapper, ContentTypeRender } from "nystem-components";

const SessionLogout = ({ children, model, path, ...props }) => {
  const { item, to, btnType, ...rest } = model || props;
  return (
    <Wrapper
      {...rest}
      onClick={(e) => {
        app.session.logout();
        if (!to) return;

        window.history.replaceState({}, "", to);
      }}
    >
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};

export default SessionLogout;
