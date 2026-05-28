/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Component } from "react";

class ErrorBoundry extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.log(error, info);
  }

  render() {
    if (this.state.hasError)
      return (
        <div
          onClick={() => {
            this.setState({ hasError: false });
          }}
        >
          {this.props.fallback}
        </div>
      );
    return this.props.children;
  }
}
export default ErrorBoundry;
