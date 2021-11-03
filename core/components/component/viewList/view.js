import React, { useContext } from "react";
import {
  DatabaseSearchContext,
  Wrapper,
  ContentTypeRender,
  ContentTypeView,
} from "nystem-components";

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
