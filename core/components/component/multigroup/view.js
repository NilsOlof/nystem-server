import React from "react";
import app from "nystem";
import { MultigroupOneView, Wrapper } from "nystem-components";

class MultigroupView extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: props.value
    };
    this.ids = [];
    this.path = props.path ? `${props.path}.${this.model.id}` : this.model.id;
    this.state = state;

    ["setValue", "addItem", "onClose", "valid"].forEach(func => {
      this[func] = this[func].bind(this);
    });
    props.view.on("multigroupDelete", this.onClose);
  }
  setValue(id, val) {
    let { value } = this.props;
    if (!value) value = [];
    value[id] = val;
    if (this.props.setValue) this.props.setValue(this.model.id, value);
  }
  valid() {
    let valid = true;
    for (let i = 0; i < this.model.item.length; i++)
      if (this.refs[`component${i}`] && !this.refs[`component${i}`].valid())
        valid = false;
    return valid;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value)
      this.setState({ value: nextProps.value });
  }
  addItem() {
    const value = this.props.value || [];
    value.push({});
    this.props.setValue(this.model.id, value);
  }
  onClose(id) {
    if (typeof id === "object") {
      const path = id.path.split(".");
      id = parseInt(path[path.length - 1], 10);
    }
    const value = this.props.value || [];
    value.splice(id, 1);
    this.ids.splice(id, 1);
    this.props.setValue(this.model.id, value);
  }
  componentWillUnmount() {
    this.props.view.off("multigroupDelete", this.onClose);
  }
  render() {
    const self = this;
    const createItem = function(item, index) {
      if (!self.ids[index]) self.ids[index] = app().utils.uuid();
      return React.createElement(MultigroupOneView, {
        key: self.ids[index],
        ref: `component${index}`,
        id: index,
        model: self.model,
        value: item,
        setValue: self.setValue,
        add: self.props.add,
        expanded: self.model.itemExpanded,
        onClose: self.onClose,
        last: index === value.length - 1,
        view: self.props.view,
        path: self.path
      });
    };
    const value = this.props.value || [];
    return <Wrapper>{value.map(createItem)}</Wrapper>;
  }
}
export default MultigroupView;
