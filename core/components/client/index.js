import * as components from "nystem-components";

const React = require("react");
const ReactDOM = require("react-dom/client");

const base = document.createElement("div");
base.className = "react-root";
base.id = "react-root";
document.body.appendChild(base);

export default (app) => {
  let root;

  const loadDom = async () => {
    if (root) return;

    const { renderer, component, element } = await app.event(
      "getElementContext",
      {
        renderer: ReactDOM,
        component: "Index",
        element: base,
      }
    );

    root = renderer.createRoot(element);
    root.render(React.createElement(components[component]));
  };

  app.on("loaded", loadDom);
  app.on("reload", loadDom);

  app.on("unmount", () => {
    root.unmount();
    root = undefined;
  });
};
