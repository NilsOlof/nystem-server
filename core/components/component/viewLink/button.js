import React from "react";
import app from "nystem";
import { Link } from "nystem-components";

const ViewLinkButton = ({ model, view }) => {
  let className = model.className ? model.className.join(" ") : "";
  const { title } = model;
  let { href = "" } = model;
  if (model.renderType) className += ` btn-${model.renderType}`;
  if (href[href.length - 1] === "/" && view.value) href += view.value._id;

  return (
    <Link
      className={`${className} btn`}
      to={href}
      match={model.match}
      type="button"
      title={title || ""}
    >
      {app().t(model.text)}
    </Link>
  );
};
export default ViewLinkButton;
