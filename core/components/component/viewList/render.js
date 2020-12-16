import React from "react";
import { ContentTypeView } from "nystem-components";

import "./table.css";

const ViewListRender = ({ model, view, value }) => {
  const { rowClassName = [] } = model;
  value = model.value || value;

  function createItem(item) {
    const id = ["number", "string"].includes(typeof item) ? item : item._id;

    const settings = {
      view: model,
      contentType: view.contentType,
      id,
      key: id,
      noForm: true,
      baseView: view,
      params: view.params,
      className: rowClassName,
      renderAs: item.renderAs,
      itemRenderAs: item.renderAs === "tr" && "td",
    };

    return <ContentTypeView {...settings} />;
  }

  return value.map(createItem);
};

export default ViewListRender;
