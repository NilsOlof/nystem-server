import * as components from "nystem-components";

const React = require("react");
const ReactDOM = require("react-dom");

const base = document.createElement("div");
base.className = "react-root";
base.id = "react-root";
document.body.appendChild(base);

export default (app) => {
  let comp;
  app.on("loaded", async () => {
    const { renderer, component, element } = await app.event(
      "getElementContext",
      {
        renderer: ReactDOM,
        component: "Index",
        element: base,
      }
    );
    comp = element;
    renderer.render(React.createElement(components[component]), element);
  });

  app.on("unmount", () => {
    ReactDOM.unmountComponentAtNode(comp);
  });
};
