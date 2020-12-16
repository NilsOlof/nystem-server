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
      <div className="loading m-2 rounded-lg shadow h-2" />
    );
  }
}

export default Loading;
