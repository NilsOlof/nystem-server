import app from "nystem";
import { Button, ContentTypeRender } from "nystem-components";

const SessionLogout = ({ children, model, path, ...props }) => {
  const { item, to, btnType, ...rest } = model || props;
  return (
    <Button
      {...rest}
      type={btnType}
      onClick={(e) => {
        app().session.logout();
        if (!to) return;

        window.history.replaceState({}, "", to);
      }}
    >
      {children || <ContentTypeRender path={path} items={item} />}
    </Button>
  );
};

export default SessionLogout;
