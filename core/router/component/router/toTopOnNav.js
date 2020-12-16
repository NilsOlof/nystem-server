import { withRouter } from "react-router";

let last = false;
const RouterToTopOnNav = ({ location }) => {
  if (location.pathname !== last) {
    last = location.pathname;
    document.documentElement.scrollTop = 0;
  }

  return null;
};

export default withRouter(RouterToTopOnNav);
