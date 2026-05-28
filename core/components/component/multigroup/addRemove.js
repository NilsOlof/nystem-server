import app from "nystem";
import { Button, Icon } from "nystem-components";

const MultigroupAddRemove = ({ model, view, setValue, value, path }) => {
  const doDelete = () => {
    const parts = path.split(".");
    const valPath = parts.slice(0, parts.length - 1).join(".");
    const parentVal = [...view.getValue(valPath)];
    parentVal.splice(parts[parts.length - 1], 1);

    view.setValue({ path: valPath, value: parentVal });
  };

  const add = model.value
    ? model.value.reduce((acc, item) => {
        // eslint-disable-next-line prefer-destructuring
        acc[item[0]] = item[1];
        return acc;
      }, {})
    : {};

  const doAdd = () => setValue([...value, { ...add }]);

  const doUp = () => {
    const parts = path.split(".");
    const valPath = parts.slice(0, parts.length - 1).join(".");
    const pos = parseInt(parts[parts.length - 1], 10);

    const parentVal = [...view.getValue(valPath)];
    const tmpVal = parentVal[pos];
    parentVal[pos] = parentVal[pos - 1];
    parentVal[pos - 1] = tmpVal;

    view.setValue({ path: valPath, value: parentVal });
  };

  value = value || [];
  const { action } = model;

  if (action === "Up" && path.endsWith(".0")) return null;

  return (
    <Button
      renderAs="button"
      className={[model.className, "rounded"]}
      type={model.btnType}
      onClick={action === "Up" ? doUp : action === "Add" ? doAdd : doDelete}
      size={model.btnSize}
      title={action}
    >
      {!model.buttonText ? (
        <Icon
          className={["h-4 w-4 ", action === "Add" && "rotate-45 transform"]}
          icon={action === "Up" ? "arrow-up" : "xmark"}
          title={action}
        />
      ) : (
        app.t(model.buttonText)
      )}
    </Button>
  );
};

export default MultigroupAddRemove;
