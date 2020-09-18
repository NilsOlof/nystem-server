import React from "react";
class Render extends React.Component {
  render() {
    let model = this.props.model || {};

    if (!model.className && !this.props.className)
      return <div>{this.props.children}</div>;

    let className = model.className ? model.className.join(" ") : "";

    if (!className && !this.props.className)
      return <div>{this.props.children}</div>;

    return (
      <div className={this.props.className + " " + className}>
        {this.props.children}
      </div>
    );
  }
}
export default Render;
