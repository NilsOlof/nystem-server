/* eslint-disable react/no-string-refs */
import React from "react";
import app from "nystem";
import { InputWrapper } from "nystem-components";

class EmailVerifiedInput extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: props.value,
    };
    if (props.add && this.model.default)
      this.props.setValue(this.model.id, this.model.default);
    this.errormsg = this.model.text_mandatory
      ? this.model.text_mandatory
      : true;
    this.validated = false;
    this.state = state;
  }
  handleChange() {
    this.validated = true;
    const { value } = this.refs.input;
    this.setState({
      value: value,
      error: this.model.mandatory && !value ? this.errormsg : false,
    });
    this.props.setValue(this.model.id, value);
  }
  valid() {
    this.validated = true;
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.errormsg,
      });
      return false;
    }
    if (this.test(this.state.value)) {
      this.setState({
        error: "Incorrect e-mail adress",
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  }
  test(value) {
    return (
      (this.validated && this.model.mandatory && !value) ||
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/im.test(value)
    );
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
  componentDidMount() {
    if (this.props.focus) this.refs.input.focus();
  }
  render() {
    return (
      <InputWrapper model={this.model} error={this.state.error}>
        <input
          ref="input"
          placeholder={app().t(this.model.text)}
          className="form-control"
          value={this.state.value}
          maxLength={this.model.length}
          onChange={this.handleChange}
          type="email"
        />
      </InputWrapper>
    );
  }
}
export default EmailVerifiedInput;
