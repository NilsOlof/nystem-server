import React from "react";
import app from "nystem";
class ErrorMsg extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: this.props.error };
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ error: nextProps.error });
  }
  render() {
    const error =
        this.state.error === true ? "Required field" : this.state.error,
      defaultType = "danger",
      className = ["alert"];
    className.push(
      "alert-" + (this.props.type ? this.props.type : defaultType)
    );
    if (this.props.className) className.push(this.props.className);
    if (error)
      return (
        <p
          className={className.join(" ")}
          dangerouslySetInnerHTML={{ __html: app().t(error) }}
        />
      );
    return null;
  }
}
export default ErrorMsg;
