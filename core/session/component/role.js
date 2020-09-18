import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

class Role extends React.Component {
  constructor(props) {
    super(props);

    app().on("login", this.sessionChange.bind(this));
    app().on("logout", this.sessionChange.bind(this));
    this.state = { visible: this.isVisible(props) };
  }
  contains(array1, array2) {
    if (typeof array1 === "string") array1 = [array1];
    if (typeof array2 === "string") array2 = [array2];

    for (let i = 0; i < array1.length; i++)
      if (array2.indexOf(array1[i]) !== -1) return true;

    return false;
  }
  isVisible(props) {
    const user = app().session.user;
    let role =
      user && user.role ? ["logged-in"].concat(user.role) : ["logged-out"];
    return this.contains(props.role.split(" "), role);
  }
  sessionChange() {
    let visible = this.isVisible(this.props);
    if (visible !== this.state.visible) this.setState({ visible });
  }

  render() {
    if (this.state.visible)
      return (
        <Wrapper className={this.props.className}>
          {this.props.children}
        </Wrapper>
      );
    return null;
  }
}
export default Role;
