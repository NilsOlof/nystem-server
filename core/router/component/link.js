import React from "react";

import { Route, Link as RLink } from "react-router-dom";

const toClassString = (className, match) => {
  className = className instanceof Array ? className.join(" ") : className;
  return match ? `${className} active` : className;
};

const Link = ({ to, className, match, children, exact }) => (
  <Route
    exact={exact}
    path={match || (typeof to === "object" ? to.pathname : to)}
  >
    {({ location, match }) => (
      <RLink to={to || "/"} className={toClassString(className, match)}>
        {children}
      </RLink>
    )}
  </Route>
);
export default Link;
