import React from "react";
import { Link, ContentTypeRender } from "nystem-components";

const ViewLinkDynamicFields = ({ view, path, model }) => {
  const insertVal = (val) => {
    if (!val) return val;
    return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1, offset, s) => {
      if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
      return view.getValue(p1.replace("..", path));
    });
  };

  const { className, exact, match, item, href } = model;

  return (
    <Link
      className={className}
      to={insertVal(href)}
      match={match}
      exact={exact}
    >
      <ContentTypeRender path={path} items={item} />
    </Link>
  );
};
export default ViewLinkDynamicFields;
