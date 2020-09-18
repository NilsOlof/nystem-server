import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";
import PropTypes from "prop-types";

class OverlayClose extends React.Component {
  handleEvent(event) {
    if (event && event.preventDefault) event.preventDefault();
    app().event("overlay", { overlayId: this.context.overlayId, do: "close" });
  }
  render() {
    const { className, renderAs, accessible } = this.props;
    return (
      <Wrapper
        renderAs={renderAs || "a"}
        className={className}
        onClick={this.handleEvent.bind(this)}
        accessible={accessible}
      >
        {this.props.children}
      </Wrapper>
    );
  }
}
OverlayClose.contextTypes = {
  overlayId: PropTypes.string
};
export default OverlayClose;
