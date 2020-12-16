import React from "react";
import app from "nystem";
import { Button } from "nystem-components";

class ErrorManager extends React.Component {
  constructor(props) {
    super(props);
    this.disconnectEvent = this.disconnectEvent.bind(this);
    this.errorEvent = this.errorEvent.bind(this);
    this.connectEvent = this.connectEvent.bind(this);
    // window.onerror = this.errorEvent;
    app().connection.on("disconnect", this.disconnectEvent);
    app().connection.on("connect", this.connectEvent);
    this.state = {
      error: false,
      offline: false,
    };
  }
  disconnectEvent() {
    this.setState({
      offline: true,
    });
  }
  connectEvent() {
    if (this.state)
      this.setState({
        offline: false,
      });
  }
  errorEvent(error, url, line) {
    const self = this;
    console.log(error);
    console.log(`URL: ${url}`);
    console.log(`Line Number: ${line}`);
    this.setState({ error: "An error occured. Reload?" });
    if (this.errorTimer) clearTimeout(this.errorTimer);
    this.errorTimer = setTimeout(() => {
      self.setState({ error: false });
    }, 5000);
  }
  errorReload(error, url, line) {
    window.location.reload();
  }
  componentWillUnmount() {
    clearTimeout(this.errorTimer);
    app().connection.off("disconnect", this.disconnectEvent);
    app().connection.off("connect", this.connectEvent);
  }
  render() {
    if (this.state.error || this.state.offline)
      return (
        <Button className="btn-danger btn" onClick={this.errorReload}>
          {this.state.error || "Site is offline"}
        </Button>
      );
    return <div />;
  }
}
export default ErrorManager;
