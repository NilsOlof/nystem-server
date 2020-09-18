import React from "react";
import { Button } from "nystem-components";

class SelectButton extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    const state = {
      value: props.value
    };
    if (props.validated)
      props.setValue(this.model.id, state.value, this.valid());
    this.state = state;
  }
  handleChange = e => {
    const { model } = this;
    e.preventDefault();
    this.props.setValue(
      this.model.id,
      model.trueOnState.indexOf(this.state.value)
        ? model.trueState
        : model.falseState
    );
  };
  valid = () => {
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.model.text_mandatory ? this.model.text_mandatory : true
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  };
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value)
      this.setState({
        value: nextProps.value
      });
  }
  render() {
    const { model } = this;
    let className = this.model.className ? ` ${model.className.join(" ")}` : "";
    let text = "";
    let type = false;
    if (model.trueOnState.indexOf(this.state.value) !== -1) {
      text = model.text;
      type = model.btnType;
    } else if (model.falseOnState.indexOf(this.state.value) !== -1) {
      text = model.falseText;
      type = model.falseBtnType;
    }
    return (
      <Button type={type} className={className} onClick={this.handleChange}>
        {text || "..."}
      </Button>
    );
  }
}
export default SelectButton;
