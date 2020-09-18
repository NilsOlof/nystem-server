import React from "react";
import app from "nystem";
import { ContentTypeView } from "nystem-components";

class SessionUser extends React.Component {
  constructor(props) {
    super(props);
    app().on("login", this.sessionChange.bind(this));
    app().on("logout", this.sessionChange.bind(this));

    const session = app().session.user;
    this.state = { userid: session ? session._id : null };
  }
  sessionChange() {
    const session = app().session.user;
    this.setState({ userid: session ? session._id : null });
  }
  render() {
    const { view, model } = this.props;
    if (this.state.userid && model.toformat !== view.format)
      return (
        <ContentTypeView
          key={this.state.userid}
          contentType={view.contentType}
          format={model.toformat}
          id={this.state.userid}
          baseView={view}
        />
      );
    return null;
  }
}
export default SessionUser;
