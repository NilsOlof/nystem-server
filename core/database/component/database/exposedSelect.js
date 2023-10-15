import { SelectInput, UseSearch, RouterUseQueryStore } from "nystem-components";
import app from "nystem";

const getDate = (all) => {
  const delta = parseInt(all.replace("now", ""), 10);
  const ref = new Date();
  ref.setDate(ref.getDate() + delta);
  return ref.getTime();
};

const DatabaseExposedSelect = ({ model, view, path }) => {
  const insertVal = (val) =>
    val.replace(/\{([a-z_.0-9+-]+)\}/gim, (str, p1) => {
      let val = "";
      if (p1 === "_language") val = app().settings.lang;
      else if (p1 === "_userid") val = app().session.user?._id;
      else if (p1 === "id") val = view.id;
      else if (p1 === "now") val = Date.now();
      else if (p1.startsWith("now")) val = getDate(p1);
      else if (p1.indexOf("params.") === 0)
        val = view.params[p1.replace("params.", "")];
      else if (p1.indexOf("baseView.") !== 0)
        val = view.getValue(p1.replace("..", path));
      else {
        p1 = p1.replace("baseView.", "");
        if (p1.startsWith("baseView.")) {
          p1 = p1.replace("baseView.", "");
          val = view.baseView.baseView.getValue(p1.replace("..", path));
        } else val = view.baseView.getValue(p1.replace("..", path));
      }
      if (val instanceof Array) val = val.join("|");
      return val || "";
    });

  const [at, setAt] = RouterUseQueryStore(model.saveId, "int");

  const [, field, value = ""] = model.options[at] || [];
  UseSearch({ view, id: field, value: insertVal(value), noListen: true });

  return (
    <SelectInput
      model={{
        ...model,
        option: model.options.map((item, index) => ({
          _id: index,
          text: item[0],
        })),
        limit: 1,
      }}
      value={at}
      setValue={setAt}
    />
  );
};

export default DatabaseExposedSelect;
