import { useLocation, Wrapper } from "nystem-components";

const Link = ({ to, className, match, children, addSearch }) => {
  const { isMatch, pathname, search } = useLocation(match || to);

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
        window.history.pushState({}, "", to + (addSearch ? search : ""));
      }}
    >
      {children}
    </Wrapper>
  );
};
export default Link;
