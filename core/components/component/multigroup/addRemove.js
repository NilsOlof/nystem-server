import app from "nystem";
import { Button, Icon } from "nystem-components";

const MultigroupAddRemove = ({ model, view, setValue, value, path }) => {
  const doDelete = () => {
    const parts = path.split(".");
    const valPath = parts.slice(0, parts.length - 1).join(".");
    console.log({ valPath, parts }, view.getValue(valPath));
    const parentVal = [...view.getValue(valPath)];
    parentVal.splice(parts[parts.length - 1], 1);

    view.setValue({ path: valPath, value: parentVal });
  };

  const doAdd = () => setValue([...value, {}]);

  value = value || [];
  const { action } = model;

  return (
    <Button
      renderAs="button"
      className={[model.className, "rounded"]}
      type={model.btnType}
      onClick={action === "Add" ? doAdd : doDelete}
      size={model.btnSize}
      title={action}
    >
      {!model.buttonText ? (
        <Icon
          className={["h-4 w-4 ", action === "Add" && "rotate-45 transform"]}
          icon="xmark"
          title={action}
        />
      ) : (
        app().t(model.buttonText)
      )}
    </Button>
  );
};

export default MultigroupAddRemove;
