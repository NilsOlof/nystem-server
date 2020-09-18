import React from "react";
import app from "nystem";
import { ContentTypeView } from "nystem-components";
class ReferenceDynamicForm extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.props.view.on("save", this.onSave);
    this.localValue = {};
    const self = this;
    const state = {};
    app().require(["dynamicForm", "fieldDefinitions"], function() {
      app().dynamicForm.generate(
        self.props.view.contentType,
        self.model.source,
        self.model.transformContentType,
        self.props.view.value,
        function(id) {
          if (typeof state.value !== "undefined")
            self.setState({
              value: id
            });
          else state.value = id;
        }
      );
    });
    if (typeof state.value === "undefined") state.value = false; //'dynamicType' + self.props.view.value._id
    this.state = state;
  }
  componentWillReceiveProps(nextProps) {
    /*this.setState({
      value: nextProps.value
    });*/
  }
  render() {
    const model = this.props.model;
    const format = model.view ? model.view : "input";
    if (this.state.value)
      return (
        <ContentTypeView
          noForm="true"
          className={model.className}
          contentType={this.state.value}
          format={format}
          value={{}}
          id={this.props.view.params[3]}
          params={this.props.view.params}
        />
      );
    return null;
  }
}
export default ReferenceDynamicForm;
