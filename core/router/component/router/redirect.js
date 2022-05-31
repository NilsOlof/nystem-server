import { useEffect } from "react";

const RouterRedirect = ({ to, model = {}, view, path }) => {
  useEffect(() => {
    const insertVal = (val) =>
      val &&
      val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
        if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
        return view.getValue(p1.replace("..", path));
      });

    window.history.replaceState({}, "", insertVal(model.to || to));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};

export default RouterRedirect;
