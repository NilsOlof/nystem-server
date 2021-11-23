import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

class ViewTextTokenFallbackNew extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    const state = {
      value: app().clone(this.view.value),
      text: this.insertVal(this.model.text),
    };
    this.view.on("change", this.setValueView);
    this.state = state;
  }
  setValueView() {
    const self = this;
    if (JSON.stringify(this.view.value) !== JSON.stringify(this.state.value))
      setTimeout(() => {
        if (self.isMounted())
          self.setState({
            value: app().clone(self.view.value),
            text: self.insertVal(self.model.text),
          });
      }, 0);
  }
  insertVal(val) {
    if (!val) return val;
    const self = this;
    this.val = false;
    return val.replace(/\{([a-z_.]+)\}/gim, (str, p1) => {
      const val = self.view.getValue(p1.replace("..", self.props.path));
      self.val = self.val || val;
      return typeof val === "undefined" ? "" : val;
    });
  }
  componentWillUnmount() {
    this.view.off("change", this.setValueView);
  }
  render() {
    const className = this.model.className
      ? this.model.className.join(" ")
      : "";
    const renderAs = this.props.model.renderAs
      ? this.props.model.renderAs
      : this.props.model.format;
    const text = this.val
      ? this.state.text
      : `New ${app().contentType[this.view.contentType].name}`;
    return (
      <Wrapper renderAs={renderAs} className={className}>
        {app().t(text)}
      </Wrapper>
    );
  }
}
export default ViewTextTokenFallbackNew;
