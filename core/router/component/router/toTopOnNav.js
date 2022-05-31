import { UseLocation } from "nystem-components";

let last = false;
const RouterToTopOnNav = () => {
  const location = UseLocation();

  if (location.pathname !== last) {
    last = location.pathname;
    document.documentElement.scrollTop = 0;
  }

  return null;
};

export default RouterToTopOnNav;
