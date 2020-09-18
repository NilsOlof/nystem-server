import React from "react";
import app from "nystem";
import { InputWrapper } from "nystem-components";

class ReferenceDropdown extends React.Component {
  constructor(props) {
    super(props);
    const self = this;
    this.model = props.model;
    const state = {
      value: props.value,
      option: []
    };
    this.namefield = this.model.namefield ? this.model.namefield : "name";
    if (this.model.default && !state.value)
      self.props.setValue(this.model.default);

    state.option = [];

    this.state = state;
  }
  handleChange = () => {
    const { value } = this.refs.input;
    this.props.setValue(value);
  };
  valid = () => {
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.model.text_mandatory ? this.model.text_mandatory : true
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  };
  loadOption = () => {
    const { model, getValue, path } = this.props;
    app()
      .database[model.source].search({
        autoUpdate: true,
        filter: app().parseFilter(model.filter, getValue, path),
        count: 100
      })
      .then(({ data, offline }) => {
        if (offline) {
          app().connection.on("connect", this.loadOption);
          app().connection.on("connect", this.loadOption);
        } else app().connection.off("connect", this.loadOption);

        this.setState({ option: data });
      });
  };
  componentDidMount() {
    this.loadOption();
  }
  componentWillUnmount() {
    app().connection.off("connect", this.loadOption);
  }
  render() {
    const self = this;
    let { value } = this.props;
    if (!value) value = [];
    if (!(value instanceof Array)) value = [value];

    const optionData = this.state.option || [];

    function option(item, index) {
      if (!item) return null;
      return (
        <option key={item._id || index} value={item._id}>
          {item[self.namefield]}
        </option>
      );
    }

    return (
      <InputWrapper model={this.model} error={this.state.error}>
        <select
          className="block sm:w-1/2 w-full bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-2 px-3"
          onChange={this.handleChange}
          value={value[0]}
          ref="input"
        >
          <option key="_" id="" value="">
            -- select --
          </option>
          {optionData.map(option)}
        </select>
      </InputWrapper>
    );
  }
}
export default ReferenceDropdown;
// 57 40 35
