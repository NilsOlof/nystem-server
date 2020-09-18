import React from "react";
import app from "nystem";
import { Link, Icon } from "nystem-components";
class ViewLinkLink extends React.Component {
  render() {
    const model = this.props.model;
    const className = model.className ? model.className.join(" ") : "";
    const href =
      model.href && this.props.view.id
        ? model.href.replace("{id}", this.props.view.id)
        : model.href;

    if (model.blank)
      return (
        <a
          className={className}
          href={href}
          rel="noopener noreferrer"
          target="_blank"
        >
          {app().t(model.text)}
        </a>
      );

    if (model.renderType === "icon")
      return (
        <Link to={href} match={model.match} type="link">
          <Icon className={className} />
        </Link>
      );

    return (
      <Link className={className} to={href} match={model.match} type="link">
        {app().t(model.text)}
      </Link>
    );
  }
}
export default ViewLinkLink;
