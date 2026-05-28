import {
  ReferenceInput,
  useRouterQueryStore,
  useSearch,
} from "nystem-components";

const ReferenceExposedFieldViews = ({ model, view, path }) => {
  const [value, setValue] = useRouterQueryStore(model.saveId, "array");
  useSearch({ view, id: model.id, value, exact: true });

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
