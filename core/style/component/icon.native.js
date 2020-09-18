import React from "react";
import { Font } from "expo";
import app from "nystem";
import FontAwesome, { Icons } from "react-native-fontawesome";
import { Wrapper } from "nystem-components";
let fontLoaded = false;
class Icon extends React.Component {
  constructor(props) {
    super(props);
    this.loadFontAwesome = this.loadFontAwesome.bind(this);
    this.state = { fontLoaded };
    if (!fontLoaded) this.loadFontAwesome();
  }
  async loadFontAwesome() {
    await Font.loadAsync({
      FontAwesome: require("font-awesome/fonts/fontawesome-webfont.ttf")
    });
    fontLoaded = true;
    this.setState({ fontLoaded });
  }
  render() {
    if (!this.state.fontLoaded) return null;
    const props = this.props.className.split(" ");
    const name = props.reduce((prev, key) => {
      if (key.indexOf("fa-") === -1) return prev;
      key = key.replace("fa-", "");
      return key
        .split("-")
        .map((part, index) => {
          if (index === 0) return part;
          return app().capFirst(part);
        })
        .join("");
    }, "");

    return (
      <Wrapper
        {...this.props}
        className={this.props.className + " FontAwesome"}
      >
        {Icons[name]}
      </Wrapper>
    );
  }
}
export default Icon;
