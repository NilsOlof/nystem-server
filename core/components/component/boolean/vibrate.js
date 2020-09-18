import React from "react";
class BooleanVibrate extends React.Component {
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) this.vibrate(nextProps);
  }
  componentDidMount() {
    this.vibrate(this.props);
  }
  vibrate(props) {
    if (!navigator.vibrate) return;
    let { atState, pattern } = props.model;
    if (props.value === atState)
      navigator.vibrate(pattern ? JSON.parse(pattern) : 300);
  }
  render() {
    return null;
  }
}
export default BooleanVibrate;
