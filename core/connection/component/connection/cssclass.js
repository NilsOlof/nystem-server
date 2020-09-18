import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";
class ConnectionCssclass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { connected: app().connection.connected() };
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }
  componentDidMount() {
    app().connection.on("connect", this.update);
    app().connection.on("diconnect", this.update);
  }
  componentWillUnmount() {
    app().connection.on("connect", this.update);
    app().connection.on("diconnect", this.update);
  }
  update = () => {
    this.setState({ connected: app().connection.connected() });
  };
  render() {
    const { children, view } = this.props;
    const model = this.props.model || this.props;
    const { connected } = this.state;

    let className =
      model.className instanceof Array
        ? model.className.join(" ")
        : model.className || "";
    const connectionClass =
      (connected ? model.onlineClass : model.offlineClass) || "";
    const space = connectionClass && className ? " " : "";

    return (
      <Wrapper className={className + space + connectionClass}>
        {children ? children : model.item.map(view.createItem, this)}
      </Wrapper>
    );
  }
}

export default ConnectionCssclass;
