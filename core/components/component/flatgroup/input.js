import React from "react";
import * as components from "nystem-components";
import app from "nystem";

class FlatgroupInput extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    if (!this.model.add2id) this.model.add2id = "";
    this.state = {
      value: props.value || {},
    };
  }
  setValue(id, value) {
    const val = this.state.value;
    val[this.model.add2id + id] = value;
    if (this.props.setValue) this.props.setValue(this.model.add2id + id, val);
  }
  valid() {
    let valid = true;
    for (let i = 0; i < this.model.item.length; i++)
      // eslint-disable-next-line react/no-string-refs
      if (!this.refs[`component${i}`].valid()) valid = false;
    return valid;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value)
      this.setState({ value: nextProps.value });
  }
  render() {
    const self = this;
    let groupVal = false;
    function getGroupVal() {
      if (!groupVal) {
        if (!self.model.add2id) return self.state.value;
        groupVal = {};
        for (const item of self.state.value) {
          const startWith = new RegExp(`^${self.model.add2id}`, "i");
          if (startWith.test(item))
            groupVal[item.replace(startWith, "")] = self.state.value[item];
        }
      }
      return groupVal;
    }
    const createItem = (item, index) => {
      const value = item.id
        ? self.state.value[self.model.add2id + item.id]
        : getGroupVal();
      return React.createElement(
        components[`${app().capFirst(item.type)}Input`],
        {
          ref: `component${index}`,
          model: item,
          value: value,
          setValue: self.setValue,
          validated: self.props.validated,
          add: self.props.add,
        }
      );
    };
    return (
      <div>
        <h3>{app().t(this.model.text)}</h3>
        <div>{this.model.item.map(createItem)}</div>
      </div>
    );
  }
}
export default FlatgroupInput;
