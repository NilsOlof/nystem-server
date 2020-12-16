import React from "react";
import {
  ReferenceInput,
  RouterUseQueryStore,
  UseSearch,
} from "nystem-components";

const ReferenceExposedFieldViews = ({ model, view, path }) => {
  const [value, setValue] = RouterUseQueryStore(model.saveId, "array");
  UseSearch({ view, id: model.id, value, exact: true });

  return (
    <ReferenceInput
      model={{ ...model, mandatory: false, exposed: true }}
      setValue={setValue}
      view={view}
      value={value}
      path={path}
    />
  );
};

export default ReferenceExposedFieldViews;
