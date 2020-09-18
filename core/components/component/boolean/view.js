import React from "react";
class BooleanView extends React.Component {
  render() {
    const model = this.props.model;
    const className = model.className ? model.className.join(" ") : "";
    if (this.props.value)
      return (
        <div className={className}>
          <span className="fa fa-ok" />
        </div>
      );
    else return null;
  }
}
export default BooleanView;
