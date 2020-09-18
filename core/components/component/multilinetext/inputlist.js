import React from "react";

class MultilinetextInputlist extends React.Component {
  constructor(props) {
    super(props);
    let val = props.value || [];
    if (!(val instanceof Array)) val = [val];
    if (props.limit && val.length > props.limit)
      return { value: val.concat([]) };
    return { value: val.concat([""]) };
  }
  handleChange() {
    const val = [];
    for (let i = 0; i < this.state.value.length; i++) {
      const oneVal = this.refs[`input${i}`].value;
      if (oneVal) val.push(oneVal);
    }
    if (this.props.setValue) this.props.setValue(val);
    if (val.length > this.props.limit)
      this.setState({
        value: val.concat([])
      });
    else
      this.setState({
        value: val.concat([""])
      });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      let val = nextProps.value;
      if (typeof nextProps.value === "string") val = [nextProps.value];
      if (this.props.limit && val.length > this.props.limit)
        this.setState({ value: val.concat([]) });
      else this.setState({ value: val.concat([""]) });
    }
  }
  componentDidMount() {
    if (this.props.focus)
      this.refs[`input${this.state.value.length - 1}`].focus();
  }
  render() {
    const self = this;
    function inputField(item, index) {
      return (
        <input
          key={`input${index}`}
          ref={`input${index}`}
          className="form-control"
          value={item}
          onChange={self.handleChange}
          type="text"
        />
      );
    }
    return <div>{this.state.value.map(inputField)}</div>;
  }
}
export default MultilinetextInputlist;
