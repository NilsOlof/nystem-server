import React, { useContext } from "react";
import {
  DatabaseSearchContext,
  Wrapper,
  ContentTypeRender,
  ViewListRender,
} from "nystem-components";

import "./table.css";

const ViewListView = ({ model, view }) => {
  const { search } = useContext(DatabaseSearchContext);

  const value = (search && search.data) || [];
  const { emptyFields, className = [], headerFields, renderFormat } = model;

  if (value.length === 0 && emptyFields && emptyFields.length > 0)
    return (
      <Wrapper className={className}>
        <ContentTypeRender items={emptyFields} />
      </Wrapper>
    );

  if (model.renderFormat === "table")
    return (
      <Wrapper renderAs="table" className={className}>
        <Wrapper renderAs="thead">
          <Wrapper renderAs="tr">
            <ContentTypeRender items={headerFields} renderAs="th" />
          </Wrapper>
        </Wrapper>
        <Wrapper renderAs="tbody">
          <ViewListRender
            value={value.map((data) => ({ ...data, renderAs: "tr" }))}
            model={model}
            view={view}
          />
        </Wrapper>
      </Wrapper>
    );

  if (renderFormat === "list")
    return (
      <Wrapper className={className}>
        <ViewListRender value={value} model={model} view={view} />
      </Wrapper>
    );

  if (headerFields && headerFields.length)
    return (
      <Wrapper className={className}>
        <ContentTypeRender items={headerFields} />
        <ViewListRender value={value} model={model} view={view} />
      </Wrapper>
    );

  return (
    <Wrapper className={className}>
      <ViewListRender value={value} model={model} view={view} />
    </Wrapper>
  );
};
export default ViewListView;
