import { useEffect } from "react";
import app from "nystem";

const RouterRedirect = ({ to, model = {}, view, path }) => {
  useEffect(() => {
    const insertVal = (val) =>
      val &&
      val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
        if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
        if (p1 === "_language") return app().settings.lang;
        if (p1 === "id") return view.id;
        if (p1.indexOf("baseView.") !== 0)
          return view.getValue(p1.replace("..", path));
        p1 = p1.replace("baseView.", "");
        return view.baseView.getValue(p1.replace("..", path));
      });

    window.history.replaceState({}, "", insertVal(model.to || to));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default RouterRedirect;
