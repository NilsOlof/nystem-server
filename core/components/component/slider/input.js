import React from "react";
import { Input, Wrapper, Label, ErrorMsg } from "nystem-components";
import app from "nystem";
class SliderInput extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: props.value
    };
    if (props.add && this.model.default) {
      state.value = this.model.default;
      props.setValue(this.model.id, state.value);
    }
    if (!state.value) state.value = this.model.min;
    this.state = state;
  }
  handleChange(value) {
    this.props.setValue(this.model.id, value / 10);
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
    if (this.props.value !== nextProps.value)
      this.setState({
        value: nextProps.value
      });
  }
  componentDidMount() {
    // React 15 bug that sets wrong value on initial render, setting it again helps
    this.setState({
      value: this.state.value
    });
  }
  render() {
    const val = this.model.absolute
      ? this.state.value
      : ((this.state.value - this.model.min) / this.model.max) * 100;
    const display = this.model.precision
      ? parseFloat(val).toFixed(this.model.precision)
      : parseInt(val, 10);
    const className = this.model.className
      ? this.model.className.join(" ")
      : "";
    return (
      <Wrapper className={"form-group row " + className}>
        <Label model={this.model} />
        <Wrapper className="col-sm-9">
          <Input
            placeholder={app().t(this.model.text)}
            className="form-control-slider"
            value={parseInt(this.state.value * 10, 10)}
            onChange={this.handleChange}
            type="range"
            min={this.model.min * 10}
            max={this.model.max * 10}
          />
          <ErrorMsg error={this.state.error} />
        </Wrapper>
        <Wrapper className="col-sm-1 form-control-text">
          {"(" + display + "%)"}
        </Wrapper>
      </Wrapper>
    );
  }
}
export default SliderInput;
