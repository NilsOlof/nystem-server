import React from "react";
import app from "nystem";
class BooleanList extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.editTable = this.model.list && this.model.list.editTable;
    const state = {};
    this.state = state;
  }
  handleClick(e) {
    if (this.editTable)
      app().database[this.props.contentType].saveField(
        this.props.id,
        this.model.id,
        !this.props.value
      );
    e.preventDefault();
  }
  render() {
    if (this.props.value)
      return (
        <div>
          <input
            onClick={this.handleClick}
            type="checkbox"
            disabled={!this.editTable}
            checked
          />
        </div>
      );
    return (
      <div>
        <input
          onClick={this.handleClick}
          type="checkbox"
          disabled={!this.editTable}
        />
      </div>
    );
  }
}
export default BooleanList;
