import React from "react";
import app from "nystem";
import { Link } from "nystem-components";

class DropdownView extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    let state = {
      value: props.value,
      text: "",
      id: ""
    };
    const self = this;
    this.namefield = this.model.namefield ? this.model.namefield : "name";
    if (this.model.source && props.value && app().database[this.model.source]) {
      const directData = app()
        .database[this.model.source].get({ id: this.props.value })
        .then(({ data }) => {
          if (!directData) self.loadVal(data);
        });
      if (directData) {
        state = {
          _id: directData._id,
          text: directData[this.namefield]
        };
      }
    }
    this.state = state;
  }
  loadVal(data) {
    this.setState({
      _id: data._id,
      text: data[this.namefield]
    });
  }
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (
      this.model.source &&
      this.props.value &&
      app().database[this.model.source]
    )
      app()
        .database[this.model.source].get({ id: nextProps.value })
        .then(({ data }) => this.loadVal(data));
  }
  render() {
    if (this.model.option instanceof Array)
      return <div>{this.props.value}</div>;
    return (
      <div>
        <Link href={`/view/${this.model.source}/${this.state._id}`}>
          {this.state.text}
        </Link>
      </div>
    );
  }
}
export default DropdownView;
