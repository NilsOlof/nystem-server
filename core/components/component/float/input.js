import React from "react";
import app from "nystem";
import { InputWrapper, Input } from "nystem-components";
class FloatInput extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: this.props.value
    };
    ["handleChange", "valid"].forEach(func => {
      this[func] = this[func].bind(this);
    });
    const parts = this.model.id.split(".");
    this.id = this.props.path
      ? this.props.path + "." + parts[parts.length - 1]
      : parts[0];
    if (props.add && this.model.default)
      props.setValue(this.id, this.model.default);
    this.state = state;
  }
  handleChange(value) {
    const val = value.replace(/[^0-9.]/gim, "");
    this.setState({
      value: val,
      error: this.model.mandatory && !val ? this.errormsg : false
    });
    this.props.setValue(this.id, val);
  }
  valid() {
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.model.text_mandatory ? this.model.text_mandatory : true
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }
  render() {
    return (
      <InputWrapper model={this.model} error={this.state.error}>
        <Input
          placeholder={app().t(this.model.text)}
          className="form-control"
          value={this.state.value || ""}
          maxLength={this.model.length}
          onChange={this.handleChange}
          disabled={this.model.disabled}
          type="text"
          focus={this.props.focus}
        />
      </InputWrapper>
    );
  }
}
export default FloatInput;
