import React from "react";
import { ContentTypeView, InputWrapper } from "nystem-components";
class ReferenceDropdownFromField extends React.Component {
  constructor(props) {
    super(props);
    const model = props.model;
    const view = props.view;
    document.addEventListener("click", this.mouseUp, false);
    const state = {
      value: props.value,
      option: view.baseView.value[model.fromField],
      open: false,
      error: false,
    };
    this.state = state;
  }
  mouseUp(event) {
    if (!this.inside)
      this.setState({
        open: false,
      });
    this.inside = false;
  }
  handleChange(id) {
    this.inside = true;
    const val = this.state.value;
    const model = this.props.model;
    if (val === id || typeof id !== "string")
      this.setState({
        open: !this.state.open,
      });
    else {
      this.props.setValue(model.id, id);
      this.setState({
        open: !this.state.open,
      });
    }
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
    const model = this.props.model;
    if (this.props.value !== nextProps.value) {
      const error = this.validated && model.mandatory && !nextProps.value;
      this.setState({
        value: nextProps.value,
        error: error ? this.errormsg : false,
      });
    }
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.mouseUp, false);
  }
  render() {
    const self = this;
    const model = this.props.model;

    const value = this.state.value;

    function option(item, index) {
      if (index !== -1 && item === value) return null;
      function handleClick() {
        self.handleChange(item);
      }

      return (
        <div key={item} className="item" onClick={handleClick}>
          <ContentTypeView
            contentType={model.source}
            format={model.view}
            id={item}
            baseView={self.props.view}
          />
        </div>
      );
    }

    let selected;
    if (value) selected = option(value, -1);
    else
      selected = (
        <div onClick={this.handleChange}>
          {" "}
          -- select -- <span className="fa fa-triangle-bottom" />
        </div>
      );

    let openView = null;
    if (this.state.open)
      openView = (
        <div className="form-control dropdown-open">
          {this.state.option.map(option)}
        </div>
      );

    return (
      <InputWrapper model={model} error={this.state.error}>
        <div className="form-control dropdown">{selected}</div>
        {openView}
      </InputWrapper>
    );
  }
}
export default ReferenceDropdownFromField;
