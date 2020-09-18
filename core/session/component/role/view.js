import React from "react";
import app from "nystem";

class RoleView extends React.Component {
  constructor(props) {
    super(props);
    app().on("login", this.sessionChange);
    app().on("logout", this.sessionChange);

    this.sessionChange();

    return {};
  }
  sessionChange() {
    let session = app.session.user;
    const { fields } = this.props.model;

    if (!session) session = {};

    if (!fields || !fields.length) this.props.setValue(false, session);
    else
      for (let i = 0; i < fields.length; i++)
        this.props.setValue(fields[i], session[fields[i]]);
  }

  render() {
    return null;
  }
}
export default RoleView;
