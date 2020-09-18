import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

class ConditionalUserRole extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    const state = {
      value: props.value
    };
    state.visible = app().session.user
      ? this.contains(app().session.user.role, this.model.role)
      : false;
    this.state = state;
  }
  contains(array1, array2) {
    if (typeof array1 === "string") array1 = [array1];
    if (typeof array2 === "string") array2 = [array2];

    for (let i = 0; i < array1.length; i++)
      if (array2.indexOf(array1[i]) !== -1) return true;

    return false;
  }
  render() {
    const className = this.props.model.className
      ? this.props.model.className.join(" ")
      : "";
    if (this.state.visible)
      return (
        <Wrapper className={className}>
          {this.model.item.map(this.props.view.createItem, this)}
        </Wrapper>
      );
    return null;
  }
}
export default ConditionalUserRole;
