import * as components from "nystem-components";
import { BrowserRouter as Router } from "react-router-dom";

const React = require("react");
const ReactDOM = require("react-dom");

export default function (app) {
  app.on("loaded", () => {
    const insertComponent = app.settings.insertComponent
      ? app.settings.insertComponent
      : {
          component: "",
        };

    let base = insertComponent.domSelect
      ? document.querySelectorAll(insertComponent.domSelect)[0]
      : document.body;
    if (insertComponent.insertType && insertComponent.insertType !== "html") {
      const into = document.createElement("span");
      if (insertComponent.insertType === "append") base.appendChild(into);
      if (insertComponent.insertType === "prepend")
        base.insertBefore(into, base.firstChild);
      base = into;
    }

    if (base === document.body && !app.settings.noBaseDiv) {
      base = document.createElement("div");
      base.className = "react-root";
      base.id = "react-root";
      document.body.appendChild(base);
    }

    if (insertComponent.component)
      insertComponent.component = app.capFirst(insertComponent.component);

    app.reactBaseComponent = {
      component: `${insertComponent.component}Index`,
      base: base,
    };

    const render = () => {
      ReactDOM.render(
        <Router>
          {React.createElement(components.Viewport, {
            comp: components[`${insertComponent.component}Index`],
          })}
        </Router>,
        base
      );
    };
    setTimeout(render);
  });
  app.on("unmount", () => {
    const component = app.reactBaseComponent;
    ReactDOM.unmountComponentAtNode(component.base);
  });
}
