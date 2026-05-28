import { useEffect } from "react";
import app from "nystem";

const byType = {
  false: false,
  true: true,
  undefined: undefined,
  "": undefined,
};

const ViewButtonSetValueOnLoad = ({ model, view, path }) => {
  useEffect(() => {
    let value = view.getValue(model.field);
    if (model.setIfUndefined && value !== undefined) return;

    const toViewByType = {
      view: view,
      baseView: view.baseView,
      baseViewBaseView: view.baseView?.baseView,
    };

    const toView = toViewByType[model.toView || "view"];

    const insertVal = (val) => {
      if (val === "undefined") return undefined;
      if (!val) return val;
      return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
        if (p1 === "_userid") return app.session.user?._id;
        if (p1 === "_language") return app.settings.lang;
        if (p1.startsWith("query.")) {
          return (
            new URLSearchParams(window.location.search).get(
              p1.replace("query.", ""),
            ) || ""
          );
        }
        if (p1 === "id") return view.id;

        let atView = view;
        while (p1.indexOf("baseView.") === 0) {
          p1 = p1.replace("baseView.", "");
          atView = atView.baseView;
        }
        if (p1 === "_id") return atView.value._id;
        return atView.getValue(p1.replace("..", path));
      });
    };

    const insert = () => {
      if (model.value) {
        let modelValue =
          model.value.replace(/[0-9]/, "") === ""
            ? parseInt(model.value, 10)
            : insertVal(model.value);

        if (byType.hasOwnProperty(modelValue)) modelValue = byType[modelValue];

        if (value !== modelValue)
          setTimeout(() => {
            toView.setValue({ path: model.field, value: modelValue });
          }, 0);
      } else if (model.arrValue) {
        value = value || [];

        const modelValue = model.arrValue
          .map((val) =>
            val.replace(/[0-9]/, "") === "" ? parseInt(val, 10) : val,
          )
          .map((val) => (byType.hasOwnProperty(val) ? byType[val] : val));

        const add = modelValue
          .filter((val) => val)
          .filter((val) => !value.includes(val));

        if (add.length)
          setTimeout(() => {
            toView.setValue({ path: model.field, value: [...value, ...add] });
          }, 0);
      }
    };
    setTimeout(insert, 50);
    view.on("clearOnSave", insert);
    return () => {
      view.off("clearOnSave", insert);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, view.id]);

  return null;
};

export default ViewButtonSetValueOnLoad;
