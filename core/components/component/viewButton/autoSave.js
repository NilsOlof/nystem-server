import React from "react";
import app from "nystem";
class ViewButtonAutoSave extends React.Component {
  constructor(props) {
    super(props);
    this.model = props.model;
    this.view = props.view;
    this.handleChange = this.handleChange.bind(this);
    this.saveToDb = this.saveToDb.bind(this);
    this.view.on("change", this.handleChange);
    this.oldVal = props.view.value ? JSON.stringify(props.view.value) : {};
    this.state = {};
  }
  handleChange = ({ id }) => {
    if (!id || id === "_id" || !this.view.value) return;

    if (!this.saveVals) this.saveVals = {};

    this.saveVals[id.split(".")[0]] = this.view.value[id.split(".")[0]];

    this.saveDelay = setTimeout(this.saveToDb, 200);

    console.log(this.saveVals);
    return false;
  };
  saveToDb = () => {
    console.log(this.saveVals);
    const self = this;
    if (this.saveVals && this.view.valid()) {
      if (this.view.value._id) this.saveVals._id = this.view.value._id;
      else if (this.view.id) this.saveVals._id = this.view.id;
      console.log({
        data: this.saveVals,
        fields: true
      });
      app()
        .database[this.view.contentType].save({
          data: this.saveVals,
          fields: true
        })
        .then(data => {
          if (!self.view.value._id) self.view.setValue("_id", data);

          self.view.event("save", self.view.value);
        });

      delete this.saveVals;
    }
  };
  componentWillUnmount() {
    this.view.off("change", this.handleChange);
    if (this.saveDelay) clearTimeout(this.saveDelay);
  }
  render() {
    return null;
  }
}
export default ViewButtonAutoSave;
