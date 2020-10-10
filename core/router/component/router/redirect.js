import { useEffect } from "react";
import { useHistory } from "react-router-dom";

const RouterRedirect = ({ model, view, path }) => {
  const history = useHistory();

  useEffect(() => {
    const insertVal = (val) =>
      val &&
      val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1, offset, s) => {
        if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
        return view.getValue(p1.replace("..", path));
      });

    history.replace(insertVal(model.to));
  }, [history, model, path, view]);

  return null;
};

export default RouterRedirect;
