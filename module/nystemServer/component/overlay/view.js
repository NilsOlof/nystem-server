import React from "react";
import app from "nystem";

class OverlayView extends React.Component {
  onClick = event => {
    event.preventDefault();
    let { model } = this.props;
    model = model || this.props;
    app().event("addOverlay", model);
  };
  render() {
    let { model } = this.props;
    model = model || this.props;
    const className = model.className ? model.className.join(" ") : "";
    return (
      <a className={className} href={model.link} onClick={this.onClick}>
        {app().t(model.text)}
      </a>
    );
  }
}
export default OverlayView;
