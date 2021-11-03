import React from "react";
import { InputWrapper, IntInput } from "nystem-components";

class IntExposedField extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    props.view.searchProp.onUpdate(this.update);
    this.classNameBase = this.model.className ? this.model.className : [];
    this.updateCounter = 0;
  }
  update() {
    if (this.id) {
      const state = {};
      const modelId = this.model.id;

      state.from = this.props.view.searchProp.filter.get(`${this.id}_from`);
      if (state.from !== "undefined" && state.from[modelId])
        state.from = state.from[modelId].substring(1);
      else delete state.from;

      state.to = this.props.view.searchProp.filter.get(`${this.id}_to`);
      if (state.to !== "undefined" && state.to[modelId])
        state.to = state.to[modelId].substring(1);
      else delete state.to;
      if (typeof state.from !== "undefined" || typeof state.to !== "undefined")
        this.setState(state);
    }
    const self = this;
    if (this.updateCounter > 0) this.updateCounter--;
    if (this.state.className === "" || this.updateCounter > 0) return;
    this.setState({
      className: "has-success",
    });
    this.delayTimer = setTimeout(() => {
      if (self.isMounted())
        self.setState({
          className: "",
        });
    }, 1000);
  }
  search(id, value) {
    if (value === "") value = undefined;
    const self = this;
    clearTimeout(this.delayTimer);
    const state = {
      className: "has-warning",
    };
    state[id] = value;
    this.setState(state);
    this.delayTimer = setTimeout(() => {
      self.updateCounter++;
      if (value)
        if (id === "to") value = `<${value}`;
        else value = `>${value}`;

      self.props.view.searchProp.filter.add(
        self.model.id,
        value,
        `${self.id}_${id}`
      );
    }, 200);
  }
  componentDidMount() {}
  componentWillUnmount() {
    this.props.view.searchProp.offUpdate(this.update);
    clearTimeout(this.delayTimer);
  }
  render() {
    /* const model = this.props.model;
    const className = model.className && !this.props.wrapper
      ? model.className.join(" ")
      : ""; */
    const modelFrom = {
      id: "from",
      placeholder: "From",
      clearButton: true,
    };
    const modelTo = {
      id: "to",
      placeholder: "To",
      clearButton: true,
    };
    const style = {
      width: "100px",
    };
    return (
      <InputWrapper model={this.model} error={this.state.error}>
        <div className="form-inline">
          <IntInput
            style={style}
            model={modelFrom}
            value={this.state.from}
            setValue={this.search}
          />
          {" - "}
          <IntInput
            style={style}
            model={modelTo}
            value={this.state.to}
            setValue={this.search}
          />
        </div>
      </InputWrapper>
    );
  }
}
export default IntExposedField;
