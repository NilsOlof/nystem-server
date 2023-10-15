import { useContext } from "react";
import app from "nystem";
import {
  DatabaseSearchContext,
  Wrapper,
  ContentTypeRender,
  ContentTypeView,
  DragAndDropSortable,
} from "nystem-components";

const ViewListSortable = ({ model, view }) => {
  function createItem(item) {
    const id = ["number", "string"].includes(typeof item) ? item : item._id;

    return {
      view: model,
      contentType: view.contentType,
      id,
      key: id,
      noForm: true,
      baseView: view,
      params: view.params,
      className: rowClassName,
      renderAs: item.renderAs,
    };
  }
  const setValue = (value) => {
    value.forEach((id, index) => {
      app().database[view.contentType].save({
        fields: true,
        data: { _id: id, [model.sortField]: index },
      });
    });
  };

  const { search } = useContext(DatabaseSearchContext);

  const value = (search && search.data) || [];
  const { emptyFields, className = [] } = model;
  const { rowClassName = [] } = model;

  if (value.length === 0 && emptyFields && emptyFields.length > 0)
    return (
      <Wrapper className={className}>
        <ContentTypeRender items={emptyFields} />
      </Wrapper>
    );

  return (
    <Wrapper className={className}>
      <DragAndDropSortable
        Component={ContentTypeView}
        items={value.map(createItem)}
        setValue={setValue}
      />
    </Wrapper>
  );
};
export default ViewListSortable;
