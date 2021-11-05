import React from "react";
import app from "nystem";
import { Link } from "nystem-components";

const ViewLinkDynamicLink = ({ model, view, path }) => {
  const insertVal = (val) =>
    val &&
    val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
      let val = "";
      if (p1 === "_language") val = app().settings.lang;
      else if (p1 === "id") val = view.id;
      else if (p1.indexOf("params.") === 0)
        val = view.params[p1.replace("params.", "")];
      else if (p1.indexOf("baseView.") !== 0)
        val = view.getValue(p1.replace("..", path));
      else {
        p1 = p1.replace("baseView.", "");
        val = view.baseView.getValue(p1.replace("..", path));
      }
      if (val instanceof Array) val = val.join("|");
      return val;
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
