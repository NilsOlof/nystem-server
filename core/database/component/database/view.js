import React from "react";
import PropTypes from "prop-types";

class DatabaseView extends React.Component {
  static contextTypes = {
    view: PropTypes.object.isRequired,
    dataMissing: PropTypes.bool
  };
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    this.state = {
      value: this.props.value
    };
    this.path = this.props.path;
  }
  valid = () => {
    let valid = true;
    for (let i = 0; i < this.model.item.length; i++)
      if (
        this.refs[`component${i}`].valid &&
        this.refs[`component${i}`].valid &&
        !this.refs[`component${i}`].valid()
      )
        valid = false;
    return valid;
  };
  setValue = (id, value) => {
    return this.props.setValue(id, value);
  };
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }
  render() {
    const { model } = this.props;
    const { view, dataMissing } = this.context;
    this.focus = view.focus;
    if (!dataMissing) return model.item.map(view.createItem, this);
    return null;
  }
}
export default DatabaseView;
