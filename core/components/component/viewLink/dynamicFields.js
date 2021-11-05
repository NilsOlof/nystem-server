import React from "react";
import { Link, ContentTypeRender } from "nystem-components";

const ViewLinkDynamicFields = ({ view, path, model }) => {
  const insertVal = (val) => {
    if (!val) return val;
    return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
      if (p1 === "id") return view.id;

      if (p1.indexOf("params.") === 0)
        return view.params[p1.replace("params.", "")];

      if (p1.indexOf("baseView.") !== 0)
        return view.getValue(p1.replace("..", path));

      p1 = p1.replace("baseView.", "");
      return view.baseView.getValue(p1.replace("..", path));
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
