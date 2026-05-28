import { useLocation } from "nystem-components";

let last = false;
const RouterToTopOnNav = () => {
  const location = useLocation();

  if (location.pathname !== last) {
    last = location.pathname;
    document.documentElement.scrollTop = 0;
  }

  return null;
};

export default RouterToTopOnNav;
