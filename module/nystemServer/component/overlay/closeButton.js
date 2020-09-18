import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

class OverlayCloseButton extends React.Component {
  handleEvent(event) {
    event.preventDefault();
    const { view, path } = this.props;
    const toPath = path || view.contentType + "/" + view.format + "/" + view.id;
    app()
      .event("closeOverlay", toPath)
      .then(data => {});
  }
  render() {
    const { model, view } = this.props;
    let { className } = this.props;
    className = className || model.className ? model.className.join(" ") : "";
    return (
      <Wrapper
        renderAs={model.renderAs || "a"}
        className={className}
        onClick={this.handleEvent.bind(this)}
      >
        {model.item.map(view.createItem, this)}
      </Wrapper>
    );
  }
}
export default OverlayCloseButton;
