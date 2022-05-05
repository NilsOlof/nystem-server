import React from "react";
import { TextExposedField } from "nystem-components";

const ViewListSearch = ({ model, view }) => (
  <TextExposedField
    view={view}
    model={{ text: "Search", ...model, id: "$all" }}
  />
);

export default ViewListSearch;
