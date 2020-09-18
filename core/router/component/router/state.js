import React from "react";
import app from "nystem";
import PropTypes from "prop-types";

class RouterState extends React.Component {
  getPath = context => {
    return context.router.history.location.pathname;
  };
  componentDidMount() {
    let pathname = this.getPath(this.context);
    console.log("pathname", pathname);
    if (this.props.save === "storage")
      app()
        .storage.getItem({ id: "router.pathname" })
        .then(({ value }) => {
          if (value && value !== pathname)
            this.context.router.history.replace(value);
          else if (this.props.start && pathname === "/")
            this.context.router.history.replace(this.props.start);
        });
    else if (this.props.save === "memory" && app().pathname) {
      if (app().pathname !== pathname)
        this.context.router.history.replace(app().pathname);
    } else if (this.props.start && pathname === "/")
      this.context.router.history.replace(this.props.start);
    else if (this.props.redirect) {
      if (pathname.indexOf(this.props.match) === 0) {
        pathname = pathname.replace(this.props.match, "");
        this.context.router.history.replace(this.props.redirect + pathname);
        return;
      }
    }
  }

  componentWillUnmount() {}

  UNSAFE_componentWillReceiveProps(nextProps, nextContext) {
    if (this.props.save === "memory")
      app().pathname = this.getPath(this.context);
    if (this.props.save === "storage")
      app().storage.setItem({
        id: "router.pathname",
        value: this.getPath(this.context)
      });
  }

  render() {
    return null;
  }
}
RouterState.contextTypes = {
  router: PropTypes.object
};
export default RouterState;

//app.storage.getItem({ id: "language" }));
