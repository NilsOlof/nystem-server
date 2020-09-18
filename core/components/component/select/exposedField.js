import React, { useEffect, useState, useContext } from "react";
import { SelectInput, DatabaseSearchContext } from "nystem-components";
import app from "nystem";

const SelectExposedField = ({ model }) => {
  const [id] = useState(app().uuid());
  const [className, setClassName] = useState("");
  const [value, setValue] = useState("");
  const [timer, setTimer] = useState(false);
  const { setFilter } = useContext(DatabaseSearchContext);

  useEffect(
    () => () => {
      if (timer) clearTimeout(timer);
    },
    [timer]
  );

  const onChange = value => {
    setClassName("border-orange-300 outline-none");

    setFilter({ id, modelId: model.id, value }).then(() => {
      setClassName("border-green-500 outline-none");
      clearTimeout(timer);
      setTimer(setTimeout(() => setClassName(""), 1000));
    });
    setValue(value);
  };

  return (
    <SelectInput
      model={{
        ...model,
        clearButton: true,
        inputClassName: `w-full ${className}`,
        selectAllOnFocus: true
      }}
      value={value}
      setValue={onChange}
    />
  );
};
export default SelectExposedField;

/*
import React from "react";
import { SelectInput } from "nystem-components";
import PropTypes from "prop-types";
import app from "nystem";

class SelectExposedField extends React.Component {
  static contextTypes = {
    search: PropTypes.object,
    view: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.model = props.model;
    this.classNameBase = this.model.className || [];
    this.id = app().uuid();
    this.state = { value: this.props.value || "", className: "" };
  }

  setSearch = (id, value) => {
    const { view, search } = this.context;
    const { model } = this.props;

    this.setState({ className: "has-warning", value });

    search.filter = search.filter || {};
    search.filter.$and = (search.filter.$and || []).filter(
      obj => obj.__id !== this.id
    );
    search.filter.$and.push({ __id: this.id, [model.id]: value });

    view.event("search", search).then(() => {
      this.setState({ className: "has-success" });
      this.delayTimer = setTimeout(() => this.setState({ className: "" }), 400);
    });
  };

  componentWillUnmount() {
    clearTimeout(this.delayTimer);
  }

  render() {
    this.model.className = [...this.classNameBase, this.state.className];
    this.model.clearButton = true;
    return (
      <SelectInput
        model={this.model}
        value={this.state.value}
        setValue={this.setSearch}
      />
    );
  }
}
export default SelectExposedField;
*/
