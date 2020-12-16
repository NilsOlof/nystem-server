import React from "react";
import { InputWrapper } from "nystem-components";
import app from "nystem";

class TextareaInput extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: props.value,
    };
    ["handleChange", "valid"].forEach((func) => {
      this[func] = this[func].bind(this);
    });
    if (props.validated)
      props.setValue(this.model.id, state.value, this.valid());
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
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.model.text_mandatory ? this.model.text_mandatory : true,
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value)
      this.setState({
        value: nextProps.value,
      });
  }
  render() {
    const height = {};
    if (this.model.height) height.height = `${this.model.height}px`;
    return (
      <InputWrapper model={this.model} error={this.state.error}>
        <textarea
          ref="input"
          placeholder={app().t(this.model.placeholder || this.model.text)}
          className="form-control"
          value={this.state.value}
          maxLength={this.model.length}
          onChange={this.handleChange}
          type="text"
          style={height}
        />
      </InputWrapper>
    );
  }
}
export default TextareaInput;
