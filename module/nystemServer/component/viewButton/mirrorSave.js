import React from "react";
import app from "nystem";
class ViewButtonMirrorSave extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    this.handleChange = this.handleChange.bind(this);
    this.saveToDb = this.saveToDb.bind(this);
    this.view.on("change", this.handleChange);

    this.oldVal = this.props.view.value
      ? JSON.stringify(this.props.view.value)
      : {};
    if (!this.model.saveOn) return {};

    if (this.model.saveOn.indexOf("baseView") !== -1)
      this.view.baseView.on("save", this.saveToDb);
    if (this.model.saveOn.indexOf("baseView.baseView") !== -1)
      this.view.baseView.baseView.on("save", this.saveToDb);
    if (this.model.saveOn.indexOf("baseView.baseView.baseView") !== -1)
      this.view.baseView.baseView.baseView.on("save", this.saveToDb);
  }
  insertVal(val) {
    if (!val) return val;
    const self = this;
    return val.replace(/\{([a-z_.]+)\}/gim, function(str, p1, offset, s) {
      if (p1.indexOf("baseView.") !== 0) return self.view.baseView.getValue(p1);
      p1 = p1.replace("baseView.", "");
      if (p1.indexOf("baseView.") !== 0)
        return self.view.baseView.baseView.getValue(p1);
      p1 = p1.replace("baseView.", "");
      return self.view.baseView.baseView.baseView.getValue(p1);
    });
  }
  handleChange(id) {
    if (!id || !this.view.value) return;

    if (!this.saveVals) this.saveVals = {};

    this.saveVals[id] = this.view.value[id];
  }
  saveToDb() {
    const self = this;
    if (this.saveVals && this.view.valid()) {
      if (this.view.value._id) this.saveVals._id = this.view.value._id;

      app().database[this.view.contentType].save(
        {
          data: this.saveVals,
          fields: true
        },
        function(data) {
          if (!self.view.value._id) self.view.setValue("_id", data);

          self.view.event("save", self.view.value);
        }
      );

      delete this.saveVals;
    }
  }
  componentDidMount() {
    if (this.model.insertVal)
      this.model.insertVal.forEach(item => {
        this.view.setValue(item[0], this.insertVal(item[1]));
      });
  }
  componentWillUnmount() {
    this.view.off("change", this.handleChange);
    if (this.saveDelay) clearTimeout(this.saveDelay);

    if (this.model.saveOn.indexOf("baseView") !== -1)
      this.view.baseView.off("save", this.saveToDb);
    if (this.model.saveOn.indexOf("baseView.baseView") !== -1)
      this.view.baseView.baseView.off("save", this.saveToDb);
    if (this.model.saveOn.indexOf("baseView.baseView.baseView") !== -1)
      this.view.baseView.baseView.baseView.off("save", this.saveToDb);
  }
  render() {
    return null;
  }
}
export default ViewButtonMirrorSave;
