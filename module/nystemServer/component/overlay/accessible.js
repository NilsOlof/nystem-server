import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";
import PropTypes from "prop-types";

class OverlayAccessible extends React.Component {
  state = { accessible: true };
  overlayEvent = options => {
    const accessible = !Object.keys(options.open).length;
    if (this.state.accessible !== accessible) {
      this.setState({ accessible });
      app().event("accessible", {
        accessible,
        accessibleId: this.accessibleId
      });
    }
  };
  getChildContext() {
    return {
      accessibleId: this.accessibleId
    };
  }

  _handleScreenReaderToggled = isEnabled => {
    this.setState({
      screenReaderEnabled: isEnabled
    });
  };
  componentDidMount(event) {
    this.accessibleId = app().uuid();
    app().on("overlay", this.overlayEvent);
  }
  componentWillUnmount(event) {
    app().off("overlay", this.overlayEvent);
  }
  render() {
    const { accessible } = this.state;
    return (
      <Wrapper accessible={accessible ? undefined : false}>
        {this.props.children}
      </Wrapper>
    );
  }
}
OverlayAccessible.contextTypes = {
  overlayId: PropTypes.string
};
OverlayAccessible.childContextTypes = {
  accessibleId: PropTypes.string
};
export default OverlayAccessible;
