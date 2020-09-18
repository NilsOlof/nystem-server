import React from "react";
import app from "nystem";
import { SelectExposedField } from "nystem-components";

class ReferenceExposedField extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.state = {
      value: props.value,
      option: []
    };
  }
  componentDidMount() {
    app()
      .database[this.model.source].search({
        autoUpdate: true,
        filter: app().parseFilter(
          this.model.filter,
          this.props.getValue,
          this.props.path
        ),
        count: 100
      })
      .then(({ data: option }) => this.setState({ option }));
  }

  render() {
    const model = app().utils.clone(this.props.model);
    delete model.source;

    model.option = this.state.option.map(item => ({
      ...item,
      text: item[model.textField || "name"]
    }));
    if (!this.state.option || this.state.option.length === 0) return null;
    return <SelectExposedField model={model} view={this.props.view} />;
  }
}
export default ReferenceExposedField;
