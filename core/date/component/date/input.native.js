import React from "react";
import app from "nystem";
import { InputWrapper } from "nystem-components";
class DateInput extends React.Component {
  constructor(props) {
    super(props);
    const model = props.model;
    const format = model.dateFormat ? model.dateFormat : props.format;
    this.format = format
      ? app().utils.dateTimeFormats[format]
      : app().utils.dateTimeFormats["dateTimeLong"];
    const state = {
      value: props.value,
      formVal: props.value
        ? app()
            .utils.moment(props.value)
            .format(this.format)
        : ""
    };
    this.state = state;
  }
  loadPicker() {
    const model = this.props.model;
    const self = this;
  }
  handleChange() {
    const model = this.props.model;
    const val = this.refs.input.value;
    const valTimeStamp = app()
      .utils.moment(val)
      .valueOf();
    if (
      app()
        .utils.moment(valTimeStamp)
        .format(this.format) !== val
    ) {
      this.setState({
        formVal: val,
        invalid: true
      });
      return;
    }
    this.setState({
      formVal: val,
      invalid: false
    });
    this.props.setValue(model.id, valTimeStamp);
  }
  clearVal() {
    const model = this.props.model;
    this.props.setValue(model.id);
  }
  valid() {
    const model = this.props.model;
    if (model.mandatory && !this.state.value) {
      this.setState({
        error: model.text_mandatory ? model.text_mandatory : true
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value,
      formVal: nextProps.value
        ? app()
            .utils.moment(parseInt(nextProps.value, 10))
            .format(this.format)
        : "",
      invalid: false
    });
  }
  componentDidMount() {
    const self = this;
    if (this.props.focus) this.refs.input.focus();
    if (this.state.loaded) this.loadPicker();
  }
  render() {
    const model = this.props.model;
    const value = this.state.formVal;
    const self = this;
    if (!model.className) model.className = [];
    if (model.clearButton) model.className.push("has-feedback");
    if (this.state.invalid) model.className.push("has-error");
    else if (model.className[model.className.length - 1] === "has-error")
      model.className.pop();
    function clearButton() {
      if (!model.clearButton || !self.state.value) return;
      const style = {
        left: "143px",
        width: "10px"
      };
      return (
        <span
          style={style}
          onClick={self.clearVal}
          className="fa fa-remove pointer-cursor form-control-feedback"
          aria-hidden="true"
        />
      );
    }
    const style = this.props.style;
    //style['padding-right'] = 0;
    return (
      <InputWrapper model={model} error={this.state.error}>
        <input
          ref="input"
          placeholder={
            model.placeholder ? model.placeholder : app().t(model.text)
          }
          className="form-control"
          value={value}
          maxLength={model.length}
          onChange={this.handleChange}
          type="text"
          style={style}
        />
        {clearButton()}
      </InputWrapper>
    );
  }
}
export default DateInput;
