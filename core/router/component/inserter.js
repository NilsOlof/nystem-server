import { ContentTypeView, Wrapper, UseLocation } from "nystem-components";
import React from "react";

const checkMatch = {
  start: (path, match) => path.startsWith(match.substring(0, match.length - 1)),
  end: (path, match) => path.endsWith(match.substring(1)),
  includes: (path, match) =>
    path.includes(match.substring(1, match.length - 1)),
  exact: (path, match) => path === match,
};

const matchType = (path, match) => {
  if (!match || match === "*") return "exact";

  if (!(match instanceof Array)) match = [match];

  let checkType;
  return (
    match.find((match) => {
      checkType = match.endsWith("*") ? "start" : "exact";

      if (match.startsWith("*"))
        checkType = checkType === "start" ? "includes" : "end";

      return checkMatch[checkType](path, match);
    }) && checkType
  );
};

const Inserter = (props) => {
  const { pathname } = UseLocation();
  const { className, children, source, exclude, match } = props;

  let path = pathname;
  if (path[2] === ":") path = path.substring(3);

  if (exclude === path) return null;

  const checkType = matchType(path, props.match);
  if (!checkType) return null;

  if (children)
    return children instanceof Array && children.length ? (
      <Wrapper className={className}>{children}</Wrapper>
    ) : (
      children
    );

  if (source) {
    if (!source.includes("*")) path = source;
    else if (checkType === "start")
      path =
        source.substring(0, source.length - 1) +
        path.substring(match.length - 1);
    else if (checkType === "includes") path = source;
  }

  path = path.split("/");

  return (
    <ContentTypeView
      key={path.join("-")}
      className={className}
      contentType={path[1]}
      format={path[2]}
      id={path[3]}
      params={pathname.split("/").slice(1)}
      noForm={props.noForm}
    />
  );
};
export default Inserter;
