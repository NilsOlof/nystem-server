import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import { useLocation } from "react-router-dom";

const RouterView = ({ model, view, path }) => {
  const { className, renderAs, item } = model;
  const { pathname } = useLocation();

  const insertVal = (val) =>
    val &&
    val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1, offset, s) => {
      if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
      return view.getValue(p1.replace("..", path));
    });

  if (!pathname.match(new RegExp(insertVal(model.match)))) return null;

  return (
    <Wrapper className={className} renderAs={renderAs}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default RouterView;
