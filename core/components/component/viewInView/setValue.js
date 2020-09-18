import React from "react";
import { ContentTypeView } from "nystem-components";

class ViewInViewSetValue extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    const state = {
      value: this.view.value,
      viewId: this.insertVal(this.model.viewId),
    };
    this.view.on("change", this.setValueView);
    this.state = state;
  }
  setValueView() {
    const self = this;
    if (JSON.stringify(this.view.value) !== JSON.stringify(this.state.value))
      setTimeout(function () {
        if (self.isMounted())
          self.setState({
            value: self.view.value,
            viewId: self.insertVal(self.model.viewId),
          });
        else console.log("not mounted");
      }, 0);
  }
  setValue(id, value) {
    if (!id && !value) return;
    if (this.model.addid) {
      const val = this.state.value[this.model.addid]
        ? this.state.value[this.model.addid]
        : {};
      val[id] = value;
      this.view.setValue(this.model.addid, val);
    } else this.view.setValue(id, value);
  }
  insertVal(val) {
    if (!val) return val;
    const self = this;
    return val.replace(/\{([a-z_.]+)\}/gim, function (str, p1, offset, s) {
      return self.view.getValue(p1.replace("..", self.props.path));
    });
  }
  componentWillUnmount() {
    this.view.off("change", this.setValueView);
  }
  render() {
    const className = this.model.className
      ? this.model.className.join(" ")
      : "";
    const value = this.model.addid
      ? this.state.value[this.model.addid]
      : this.state.value;
    return (
      <ContentTypeView
        className={className}
        setValue={this.setValue}
        contentType={this.model.contentType}
        format={this.model.view}
        value={value}
        id={this.state.viewId}
      />
    );
  }
}
export default ViewInViewSetValue;
