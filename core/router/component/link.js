import { UseLocation, Wrapper } from "nystem-components";

const Link = ({ to, className, match, children }) => {
  const { isMatch, pathname, search } = UseLocation(match || to);

  if ((to === pathname || !to) && !search)
    return (
      <Wrapper className={[className, isMatch && "active"]}>{children}</Wrapper>
    );

  return (
    <Wrapper
      renderAs="a"
      href={to || "/"}
      className={[className, isMatch && !search && "active"]}
      onClick={(event) => {
        event.preventDefault();
        window.history.pushState({}, "", to);
      }}
    >
      {children}
    </Wrapper>
  );
};
export default Link;
