import React from "react";
import { DateInput } from "nystem-components";

class DateExposedField extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.props.view.searchProp.onUpdate(this.update);
    this.classNameBase = this.model.className ? this.model.className : [];
    this.updateCounter = 0;
  }
  update() {
    if (this.id) {
      const state = {};
      const modelId = this.model.id;

      state.from = this.props.view.searchProp.filter.get(`${this.id}_from`);
      if (typeof state.from !== "undefined" && state.from[modelId])
        state.from = state.from[modelId].substring(1);
      else delete state.from;

      state.to = this.props.view.searchProp.filter.get(`${this.id}_to`);
      if (typeof state.to !== "undefined" && state.to[modelId])
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
    const { model } = this.props;
    const className =
      model.className && !this.props.wrapper ? model.className.join(" ") : "";
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
      width: "150px",
    };
    return (
      <div className={`${className} form-inline`}>
        {this.model.text}
        <DateInput
          style={style}
          model={modelFrom}
          value={this.state.from}
          setValue={this.search}
        />
        {" - "}
        <DateInput
          style={style}
          model={modelTo}
          value={this.state.to}
          setValue={this.search}
        />
      </div>
    );
  }
}
export default DateExposedField;
