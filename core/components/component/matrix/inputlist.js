import React from "react";

class MatrixInputlist extends React.Component {
  constructor(props) {
    super(props);
    let val = props.value || [];
    if (!(val instanceof Array)) val = [val];
    if (val.length > props.limit) this.state = { value: val.concat([]) };
    else this.state = { value: val.concat([""]) };
  }
  handleChange() {
    const val = [];
    for (let i = 0; i < this.state.value.length; i++) {
      const oneVal = this.refs[`input${i}`].value;
      if (oneVal) val.push(oneVal);
    }
    if (this.props.setValue) this.props.setValue(val);

    this.setState({
      value: val.length > this.props.limit ? val.concat([""]) : val.concat([])
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      let val = nextProps.value;
      if (typeof nextProps.value === "string") val = [nextProps.value];
      this.setState({ value: val.concat([""]) });
    }
  }
  render() {
    const self = this;
    const inputKeyField = function(item, index) {
      return (
        <input
          ref={`inputKey${index}`}
          className="form-control"
          value={item}
          onChange={self.handleKeyChange}
          type="text"
        />
      );
    };
    const inputValueField = function(item, index) {
      return (
        <input
          ref={`inputValue${index}`}
          className="form-control"
          value={item}
          onChange={self.handleChange}
          type="text"
        />
      );
    };
    return (
      <div>
        <div className="col-sm-3">{this.state.value.map(inputKeyField)}</div>
        <div className="col-sm-3">{this.state.value.map(inputValueField)}</div>
      </div>
    );
  }
}
export default MatrixInputlist;
