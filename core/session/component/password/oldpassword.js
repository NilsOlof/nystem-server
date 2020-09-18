import React from "react";
import { InputWrapper } from "nystem-components";
import app from "nystem";
class PasswordOldpassword extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.errormsg = this.model.text_mandatory
      ? this.model.text_mandatory
      : true;
    this.validated = false;
    this.state = {};
  }
  handleChange() {
    this.validated = true;
    const value = this.refs.input.value;
    this.setState({
      value: value,
      error: this.model.mandatory && !value ? this.errormsg : false
    });
    this.props.setValue("__" + this.model.id, value);
  }
  valid() {
    this.validated = true;
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.errormsg
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
        error: error ? this.errormsg : false
      });
    }
  }
  render() {
    return (
      <InputWrapper model={this.model} error={this.state.error}>
        <input
          ref="input"
          placeholder={app().t(this.model.text)}
          className="form-control"
          value={this.state.value}
          onChange={this.handleChange}
          type="password"
        />
      </InputWrapper>
    );
  }
}
export default PasswordOldpassword;
