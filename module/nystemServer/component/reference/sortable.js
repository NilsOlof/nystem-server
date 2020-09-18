import React from "react";
import app from "nystem";
import {
  ContentTypeView,
  InputWrapper,
  DragAndDropList
} from "nystem-components";

class ReferenceSortable extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.localValue = {};
    ["setValue", "onSave", "onDelete", "addField"].forEach(func => {
      this[func] = this[func].bind(this);
    });
    this.props.view.on("save", this.onSave);
    this.state = {
      value: this.props.value
    };
  }
  setValue(id, val) {
    let { value } = this.state;
    if (!value) value = [];
    if (id) value[id] = val;
    else value = val;
    if (this.props.setValue) this.props.setValue(this.model.id, value);
  }
  onSave(data) {
    if (!this.state.value) return true;
    for (let i = 0; i < this.state.value.length; i++)
      if (this.localValue[this.state.value[i]])
        app().database[this.model.source].save({
          data: this.localValue[this.state.value[i]]
        });
    return true;
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      value: nextProps.value
    });
  }
  onDelete(id) {
    this.state.value.splice(this.state.value.indexOf(id), 1);
    const self = this;
    setTimeout(() => {
      if (self.props.setValue)
        self.props.setValue(self.props.model.id, self.state.value);
    }, 0);
    return true;
  }
  addField(data) {
    if (!data.hashtag || !this.model.addTransform) return;
    const fieldBase = JSON.parse(data.hashtag.replace(/'/g, '"'));
    const out = {};
    for (
      let i = 0;
      this.model.addTransform && i < this.model.addTransform.length;
      i++
    )
      out[this.model.addTransform[i][0]] = app().utils.insertValues(
        this.model.addTransform[i][1],
        fieldBase
      );
    return out;
  }
  render() {
    const { model } = this.props;
    let { value } = this.state;
    if (!value) value = [];
    if (!(value instanceof Array)) value = [value];
    const className =
      model.className && !this.props.wrapper ? model.className.join(" ") : "";
    const self = this;
    function option(item, index) {
      let id = item;
      function onChange(fieldId, value) {
        self.localValue[id] = value;
      }
      if (typeof item !== "string") {
        if (!item._id) item._id = app.uuid();
        id = item._id;
        self.localValue[id] = item;
        self.state.value[index] = id;
      }
      return (
        <ContentTypeView
          key={id}
          noForm="true"
          contentType={model.source}
          format={model.renderFormat ? model.renderFormat : "view"}
          onDelete={self.onDelete}
          onMissing={self.onDelete}
          onChange={onChange}
          value={self.localValue[id] ? self.localValue[id] : null}
          id={self.localValue[id] ? null : id}
          baseView={self.props.view}
        />
      );
    }
    this.id = app().uuid();
    if (model.wrapper)
      return (
        <InputWrapper model={model} error={this.state.error}>
          <div className="row col-sm-12">
            <DragAndDropList
              ref="list"
              value={this.state.value}
              setValue={this.setValue}
              onAdd={this.addField}
            >
              {value.map(option)}
            </DragAndDropList>
          </div>
        </InputWrapper>
      );
    return (
      <div className={className}>
        <DragAndDropList
          ref="list"
          value={this.state.value}
          setValue={this.setValue}
          onAdd={this.addField}
        >
          {value.map(option)}
        </DragAndDropList>
      </div>
    );
  }
}
export default ReferenceSortable;
