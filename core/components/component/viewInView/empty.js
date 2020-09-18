import React from "react";
import { ContentTypeView } from "nystem-components";

const ViewInViewEmpty = ({ model, view }) => (
  <ContentTypeView
    className={model.className}
    contentType={model.contentType}
    format={model.view}
    baseView={view}
  />
);

export default ViewInViewEmpty;
