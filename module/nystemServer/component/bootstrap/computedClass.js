import React from "react";
import { Wrapper } from "nystem-components";

class BootstrapComputedClass extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    ["valid", "setValue"].forEach(func => {
      this[func] = this[func].bind(this);
    });
    this.state = {
      value: this.props.value
    };
    this.path = this.props.path;
  }
  valid() {
    let valid = true;
    for (let i = 0; i < this.model.item.length; i++)
      if (
        this.refs[`component${i}`].valid &&
        this.refs[`component${i}`].valid &&
        !this.refs[`component${i}`].valid()
      )
        valid = false;
    return valid;
  }
  setValue(id, value) {
    return this.props.setValue(id, value);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }
  render() {
    const { view, model, path } = this.props;
    const insertVal = val =>
      val.replace(
        /\{([a-z_.]+)\}/gim,
        (str, p1, offset, s) => view.getValue(p1.replace(".", `${path}.`)) || ""
      );

    const className = model.className ? model.className.join(" ") : "";
    this.focus = view.focus;
    if (model.row)
      return (
        <Wrapper className={insertVal(className)}>
          <Wrapper className="row">
            {model.item.map(view.createItem, this)}
          </Wrapper>
        </Wrapper>
      );
    return (
      <Wrapper className={insertVal(className)} renderAs={model.renderAs}>
        {model.item.map(view.createItem, this)}
      </Wrapper>
    );
  }
}
export default BootstrapComputedClass;
