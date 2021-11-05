import React from "react";

class Label extends React.Component {
  render() {
    if (!this.props.model.text) return null;
    if (this.props.model.mandatory)
      return (
        <label htmlFor="id_input" className="col-sm-2 col-form-label">
          {this.props.model.text}
          <span className="red">*</span>
        </label>
      );
    return (
      <label htmlFor="id_input" className="col-sm-2 col-form-label">
        {this.props.model.text}
      </label>
    );
  }
}
export default Label;
