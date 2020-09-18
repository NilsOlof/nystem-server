import React from "react";
import PropTypes from "prop-types";
import app from "nystem";
import { Button } from "nystem-components";

class BooleanExposedField extends React.Component {
  static contextTypes = {
    search: PropTypes.object,
    view: PropTypes.object
  };
  constructor(props) {
    super(props);
    this.model = props.model;
    this.state = {
      value: ""
    };
    this.id = app().uuid();
  }
  handleClick(id) {
    const setVal = this.state.value === id ? "" : id;
    this.setSearch();
    this.setState({
      value: setVal
    });
  }
  setSearch = value => {
    const { view, search } = this.context;
    const { model } = this.props;
    search.filter = search.filter || {};
    search.filter.$and = (search.filter.$and || []).filter(
      obj => obj.__id !== this.id
    );
    search.filter.$and.push({
      __id: this.id,
      [model.id]: value
    });

    view.event("search", search);
  };
  render() {
    const self = this;
    let options = this.model.placeholder
      ? [
          {
            text: this.model.placeholder,
            _id: ""
          }
        ]
      : [];
    options = [
      {
        _id: "true",
        text: "True"
      },
      {
        _id: "false",
        text: "False"
      }
    ];
    const option = function(item, index) {
      function handleClick() {
        return self.handleClick(item._id);
      }
      if (value === item._id)
        return (
          <Button
            onClick={handleClick}
            className="btn btn-primary"
            key={item._id}
            value={item._id}
          >
            {item.text}
          </Button>
        );
      return (
        <Button
          onClick={handleClick}
          className="btn btn-secondary"
          key={item._id}
          value={item._id}
        >
          {item.text}
        </Button>
      );
    };
    const value =
      this.state.value instanceof Array
        ? this.state.value[0]
        : this.state.value;
    const className = this.model.className
      ? this.model.className.join(" ")
      : "";
    return (
      <div className={className}>
        <div className="mr-2">{this.model.text}</div>
        {options.map(option)}
      </div>
    );
  }
}
export default BooleanExposedField;
