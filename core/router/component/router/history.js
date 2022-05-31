import app from "nystem";
import { UseLocation } from "nystem-components";

const { history: routerHistory } = window;

let history = [];
let at = 0;

const RouterHistory = () => {
  const location = UseLocation();

  let atNew =
    history.reduce(
      (found, item, index) => found || (location.key === item.key && index + 1),
      false
    ) || history.length + 1;

  if (atNew === history.length + 1) {
    history = history.slice(0, at);
    atNew = history.length + 1;
  }

  if (atNew === history.length + 1) history.push(location);

  at = atNew;
  app().routerHistory = { history, at, routerHistory };

  return null;
};

export default RouterHistory;
