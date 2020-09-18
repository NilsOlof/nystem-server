import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";
import { AccessibilityInfo } from "react-native";

class OverlayAccessible extends React.Component {
  state = { accessible: true, screenReaderEnabled: false };
  overlayEvent = options => {
    const accessible = !Object.keys(options.open).length;
    if (this.state.accessible !== accessible) this.setState({ accessible });
  };
  _handleScreenReaderToggled = isEnabled => {
    this.setState({
      screenReaderEnabled: isEnabled
    });
  };
  componentDidMount(event) {
    app().on("overlay", this.overlayEvent);
    AccessibilityInfo.addEventListener(
      "change",
      this._handleScreenReaderToggled
    );
    AccessibilityInfo.fetch().done(isEnabled => {
      this.setState({
        screenReaderEnabled: isEnabled
      });
    });
  }
  componentWillUnmount(event) {
    app().off("overlay", this.overlayEvent);
    AccessibilityInfo.removeEventListener(
      "change",
      this._handleScreenReaderToggled
    );
  }
  render() {
    const { accessible, screenReaderEnabled } = this.state;
    if (!accessible && screenReaderEnabled) return null;
    return (
      <Wrapper accessible={this.state.accessible ? undefined : false}>
        {this.props.children}
      </Wrapper>
    );
  }
}
export default OverlayAccessible;
