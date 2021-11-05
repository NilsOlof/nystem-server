import React from "react";
import { ContentTypeView } from "nystem-components";

const ViewInViewSetValue = ({ model, view, path, value }) => {
  const { addid, viewId, contentType } = model;

  const setValue = (id, value) => {
    if (!id && !value) return;
    if (model.addid) view.setValue({ path: model.addid, value });
    else view.setValue(id, value);
  };

  const insertVal = (val) =>
    val &&
    val.replace(/\{([a-z_.]+)\}/gim, (str, p1) =>
      view.getValue(p1.replace("..", path))
    );

  return (
    <ContentTypeView
      className={model.className}
      setValue={setValue}
      contentType={contentType}
      format={model.view}
      value={addid ? value[addid] : value}
      id={insertVal(viewId)}
    />
  );
};

export default ViewInViewSetValue;
