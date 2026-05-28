import { ContentTypeView, useSearch } from "nystem-components";
import { useState } from "react";

const ReferenceExposedFieldSearch = ({ model, view }) => {
  const { renderFormat, className, source } = model;
  const [value, setValue] = useState();

  useSearch({ view, id: model.id, value, exact: model.exact });

  return (
    <ContentTypeView
      contentType={source}
      baseView={view}
      format={renderFormat}
      params={view.params}
      className={className}
      onSearch={(item) => {
        if (item.searchTotal === item.total) {
          if (value !== undefined) setValue(undefined);
        } else if (item.searchTotal === 0)
          setValue("y57d288fe62d49c292370e1ebe175db2");
        else setValue(item.data.map((item) => item._id).join("|"));
      }}
    />
  );
};
export default ReferenceExposedFieldSearch;
