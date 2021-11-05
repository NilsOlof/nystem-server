import React from "react";
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
      className={model.className}
      type={model.btnType}
      onClick={action === "Add" ? doAdd : doDelete}
      size={model.btnSize}
      title={action}
    >
      {!model.buttonText ? (
        <Icon
          className={["w-4 h-4", action === "Add" && "transform rotate-45"]}
          icon="close"
          title={action}
        />
      ) : (
        app().t(model.buttonText)
      )}
    </Button>
  );
};

export default MultigroupAddRemove;
