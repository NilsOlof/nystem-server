import { ContentTypeView } from "nystem-components";
import app from "nystem";

const ViewInViewEmpty = ({ model, view, path }) => {
  const { contentType, className, viewId } = model;

  const insertVal = (val) => {
    if (!val) return val;
    return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
      if (p1 === "_language") return app().settings.lang;
      if (p1 === "id") return view.id;
      if (p1.indexOf("baseView.") !== 0)
        return view.getValue(p1.replace("..", path));
      p1 = p1.replace("baseView.", "");
      return view.baseView.getValue(p1.replace("..", path));
    });
  };

  return (
    <ContentTypeView
      className={className}
      contentType={contentType}
      format={model.view}
      baseView={view}
      id={insertVal(viewId)}
    />
  );
};
export default ViewInViewEmpty;
