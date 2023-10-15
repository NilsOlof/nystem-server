import app from "nystem";
import { Icon, Wrapper, Button, ContentTypeRender } from "nystem-components";

const { history } = window;

const ViewButtonBack = ({ children, model, ...rest }) => {
  const { className, text, fwd, size, btnType, item } = model || rest;

  if (item)
    return (
      <Wrapper className={className} onClick={() => history.go(fwd ? 1 : -1)}>
        <ContentTypeRender path={rest.path} items={item} />
      </Wrapper>
    );

  return (
    <Button
      size={size}
      type={btnType}
      className={className}
      onClick={() => history.go(fwd ? 1 : -1)}
    >
      <Icon icon={fwd ? "arrow-right" : "arrow-left"} className="w-6" />
      <Wrapper>{children || app().t(text)}</Wrapper>
    </Button>
  );
};

export default ViewButtonBack;
