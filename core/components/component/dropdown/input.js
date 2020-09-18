import React from "react";
import app from "nystem";
import { InputWrapper } from "nystem-components";

class DropdownInput extends React.Component {
  constructor(props) {
    super(props);
    const self = this;
    this.model = props.model;
    const state = {
      value: props.value,
      option: []
    };
    const namefield = this.model.namefield ? this.model.namefield : "name";
    if (this.model.source) {
      const value = props.value || false;
      app().sourceParser(
        self.model.source,
        parsedSource => {
          self.searchProp = app()
            .database[parsedSource.source].search(
              {
                filter: parsedSource.filter
              },
              data => {
                self.handleChanges = {};
                const option = data.map(item => {
                  self.handleChanges[item._id] = function() {
                    self.handleChange(item._id);
                  };
                  return {
                    _id: item._id,
                    text: item[namefield]
                  };
                });
                if (self.state && self.state.option)
                  self.setState({ option: option });
                else state.option = option;
              }
            )
            .search();
        },
        value
      );
    } else {
      self.handleChanges = {};
      state.option = this.model.option.map(item => {
        if (typeof item === "string")
          item = {
            _id: item,
            text: item
          };
        self.handleChanges[item._id] = function() {
          self.handleChange(item._id);
        };
        return item;
      });
    }
    this.errormsg = this.model.text_mandatory
      ? this.model.text_mandatory
      : true;
    this.validated = false;
    if (!state.value && !this.model.placeholder && state.option[0])
      props.setValue(state.option[0]._id);
    this.state = state;
  }
  handleChange(id) {
    const { value } = this.refs.input;
    this.props.setValue(value);
  }
  valid() {
    this.validated = true;
    if (this.model.mandatory && !this.state.value) {
      this.setState({
        error: this.errormsg
      });
      return false;
    }
    if (this.state.error) delete this.state.error;
    return true;
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (this.props.value !== nextProps.value) {
      const error = this.validated && this.model.mandatory && !nextProps.value;
      this.setState({
        value: nextProps.value,
        error: error ? this.errormsg : false
      });
    }
  }
  componentDidMount() {
    if (this.props.focus) this.refs.input.focus();
  }
  render() {
    let options = this.model.placeholder
      ? [{ text: this.model.placeholder, _id: "" }]
      : [];
    options = options.concat(this.state.option);
    const option = function(item, index) {
      if (value === item._id)
        return (
          <option key={item._id} value={item._id} selected="selected">
            {item.text}
          </option>
        );
      return (
        <option key={item._id} value={item._id}>
          {item.text}
        </option>
      );
    };
    const value =
      this.state.value instanceof Array
        ? this.state.value[0]
        : this.state.value;
    return (
      <InputWrapper model={this.model} error={this.state.error}>
        <select
          ref="input"
          placeholder={app.t(this.model.text)}
          className="form-control"
          value={value}
          maxLength={this.model.length}
          onChange={this.handleChange}
        >
          {options.map(option)}
        </select>
      </InputWrapper>
    );
  }
}
export default DropdownInput;
