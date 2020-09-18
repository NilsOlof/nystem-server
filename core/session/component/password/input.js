import React from "react";
import { InputWrapper, Input } from "nystem-components";
import app from "nystem";

class PasswordInput extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: this.props.value,
    };
    this.handleChange = this.handleChange.bind(this);
    if (props.add && this.model.default)
      props.setValue(this.model.id, state.value);
    this.errormsg = this.model.text_mandatory
      ? this.model.text_mandatory
      : true;
    this.validated = false;
    this.state = state;

    this.id = app().uuid();
  }
  handleChange(value) {
    this.validated = true;
    this.setState({
      value: value,
      error: this.model.mandatory && !value ? this.errormsg : false,
    });
    this.props.setValue(value);
  }
  valid() {
    this.validated = true;
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.errormsg,
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      const error = this.validated && this.model.mandatory && !nextProps.value;
      this.setState({
        value: nextProps.value,
        error: error ? this.errormsg : false,
      });
    }
  }
  render() {
    return (
      <InputWrapper model={this.model} error={this.state.error} id={this.id}>
        <Input
          id={this.id}
          placeholder={app().t(this.model.text)}
          className={this.model.classNameInput || "sm:w-1/2 w-full"}
          value={this.state.value || ""}
          onChange={this.handleChange}
          type="password"
        />
      </InputWrapper>
    );
  }
}
export default PasswordInput;
