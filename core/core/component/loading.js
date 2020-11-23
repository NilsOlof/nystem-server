import React from "react";
import "./loading.css";

class Loading extends React.Component {
  state = { inDelay: true };
  componentDidMount() {
    this.delayTimer = setTimeout(() => this.setState({ inDelay: false }), 200);
  }
  componentWillUnmount() {
    clearTimeout(this.delayTimer);
  }
  render() {
    const { inDelay } = this.state;
    return inDelay ? null : (
      <div className="cssload-loader">
        <div className="cssload-inner cssload-one" />
        <div className="cssload-inner cssload-two" />
        <div className="cssload-inner cssload-three" />
      </div>
    );
  }
}
export default Loading;
