import React from "react";
import { UseLocation, Wrapper } from "nystem-components";

const Link = ({ to, className, match, children, exact }) => {
  const { isMatch, pathname } = UseLocation(match || to, exact);

  if (to === pathname || !to)
    return (
      <Wrapper className={[className, isMatch && "active"]}>{children}</Wrapper>
    );

  return (
    <Wrapper
      renderAs="a"
      href={to || "/"}
      className={[className, isMatch && "active"]}
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
