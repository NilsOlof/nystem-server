import React from "react";
import { TextExposedField } from "nystem-components";

const ViewListSearch = ({ model }) => (
  <TextExposedField model={{ text: "Search", ...model, id: "$all" }} />
);

export default ViewListSearch;
