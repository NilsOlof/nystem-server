import ReactDOM from "react-dom/client";
import { createElement } from "react";
import * as components from "nystem-components";

let base = document.getElementById("root");

if (!base) {
  base = document.createElement("div");
  base.id = "root";
  document.body.appendChild(base);
}

export default (app) => {
  const loadDom = async () => {
    const { renderer, component, element } = await app.event(
      "getElementContext",
      { renderer: ReactDOM, component: "Index", element: base },
    );

    if (!app.domRoot) app.domRoot = renderer.createRoot(element);
    app.domRoot.render(createElement(components[component], {}));
  };

  app.on("loaded", loadDom);

  app.on("unmount", () => {
    app.domRoot.unmount();
    app.domRoot = undefined;
  });
};
