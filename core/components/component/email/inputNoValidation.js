import React from "react";
import { InputWrapper, Input } from "nystem-components";
import app from "nystem";
class EmailInputNoValidation extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: props.value
    };
    ["handleChange", "valid", "validate"].forEach(func => {
      this[func] = this[func].bind(this);
    });
    if (props.add && this.model.default)
      props.setValue(this.model.id, this.model.default);
    if (state.value) this.valid(state.value);
    this.validated = false;
    this.state = state;
  }
  handleChange(value) {
    if (this.validated) this.valid(value);
    else this.setState({ value });
    this.props.setValue(this.model.id, this.lowerCase(value));
  }
  lowerCase(val) {
    if (!val) return "";
    return val.toLowerCase();
  }
  valid(value) {
    this.validated = true;
    const setval = typeof value !== "undefined" ? { value: value } : {};
    if (typeof value === "undefined") value = this.state.value;
    if (this.model.mandatory && !value) setval.error = this.errormsg;
    this.setState(setval);
    return !setval.error;
  }
  validate() {
    this.validated = true;
    this.handleChange();
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.lowerCase(this.state.value) !== this.lowerCase(nextProps.value))
      this.valid(nextProps.value);
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
          onBlur={() => this.validate}
          type="text"
          disabled={this.model.disabled}
        />
      </InputWrapper>
    );
  }
}
export default EmailInputNoValidation;
