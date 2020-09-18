import React from "react";
import { InputWrapper } from "nystem-components";
class DropdownLabelView extends React.Component {
  render() {
    return (
      <InputWrapper model={this.props.model}>
        <div className="form-control">{this.props.value}</div>
      </InputWrapper>
    );
  }
}
export default DropdownLabelView;
