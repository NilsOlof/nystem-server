import React from "react";
import app from "nystem";
import { Link } from "nystem-components";

class ViewLinkButton extends React.Component {
  render() {
    const { model } = this.props;
    let className = model.className ? model.className.join(" ") : "";
    let { href } = model;
    if (model.renderType) className += ` btn-${model.renderType}`;
    if (href[href.length - 1] === "/" && this.props.view.value)
      href += this.props.view.value._id;
    return (
      <Link
        className={`${className} btn`}
        to={href}
        match={model.match}
        type="button"
        title={this.props.title ? this.props.title : ""}
      >
        {app().t(model.text)}
      </Link>
    );
  }
}
export default ViewLinkButton;
