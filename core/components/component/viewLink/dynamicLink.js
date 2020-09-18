import React from "react";
import app from "nystem";
import { Link } from "nystem-components";

const ViewLinkDynamicLink = ({ model, view, path }) => {
  const insertVal = (val) =>
    val &&
    val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1, offset, s) => {
      if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
      return view.getValue(p1.replace("..", path));
    });

  const { href, match, className } = model;

  return (
    <Link
      className={className ? className.join(" ") : ""}
      to={insertVal(href)}
      match={insertVal(match)}
    >
      {app().t(model.text)}
    </Link>
  );
};
export default ViewLinkDynamicLink;
