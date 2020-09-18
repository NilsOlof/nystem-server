import React from "react";
import { Vibration } from "react-native";
class BooleanVibrate extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) this.vibrate(nextProps);
  }
  componentDidMount() {
    this.vibrate(this.props);
  }
  vibrate(props) {
    let { atState, pattern } = props.model;
    if (props.value === atState)
      Vibration.vibrate(pattern ? JSON.parse(pattern) : 300, false);
  }
  render() {
    return null;
  }
}
export default BooleanVibrate;
