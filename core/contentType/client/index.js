const viewCreatorFields = require("../../../viewCreatorFields.json");

const arr2Obj = (arr, byField) =>
  arr.reduce((prev, curr) => {
    prev[curr[byField]] = curr;
    return prev;
  }, {});

const objectMap = (object, mapFn) =>
  Object.keys(object).reduce((result, key) => {
    result[key] = mapFn(object[key]);
    return result;
  }, {});

const deepCopy = (obj) => obj && JSON.parse(JSON.stringify(obj));

const getId = ({ path = "", id = "" }) => {
  if (id.includes(path)) return id;

  if (path && id) return `${path}.${id}`;
  if (id) return id;
  return "";
};

const capFirst = (str) => str.substr(0, 1).toUpperCase() + str.substr(1);

const replaceInModel = ({
  model,
  viewFormat,
  fn,
  path = "",
  dynamicFields = [],
}) => {
  if (!model) return {};

  model = deepCopy(model);
  const { type, id } = model;
  const fullId = getId({ path, id });
  const format = model.format || viewFormat;

  let componentName = `${type}${capFirst(format)}`;
  if (viewCreatorFields[componentName] === undefined)
    componentName = `${type}View`;

  model = fn({ model, format, path, id, fullId });
  if (!model) return null;

  dynamicFields = [
    ...dynamicFields,
    ...(viewCreatorFields[componentName] || []),
  ];

  dynamicFields.forEach((key) => {
    if (model[key])
      model[key] = model[key]
        .map((item) =>
          replaceInModel({
            model: item,
            viewFormat,
            fn,
            path: fullId || path,
          })
        )
        .filter((model) => !!model);
  });

  return model;
};

const flattenFields = ({ item, viewCreatorFields, path = "" }) =>
  (item || []).reduce((prev, field) => {
    const { type, id } = field;
    const fullPath = path ? `${path}.${id}` : id;

    if (!type) return { [id]: field, ...prev };

    const flatten = viewCreatorFields[`${type}Definition`];
    if (!flatten) return { [fullPath]: field, ...prev };

    const subFields = flatten.reduce(
      (prev, key) =>
        field[key]
          ? flattenFields({
              item: field[key],
              viewCreatorFields,
              path: fullPath,
            })
          : prev,
      {}
    );

    return { [fullPath]: field, ...subFields, ...prev };
  }, {});

const populateViews = ({ app }) => {
  const { contentType } = app;

  const populatedViews = objectMap(deepCopy(contentType), (contentType) => {
    const { views, item } = contentType;
    if (!views) return contentType;

    const fields = flattenFields({ item, viewCreatorFields });

    const populatedViews = views.map((view) =>
      replaceInModel({
        model: { ...view, type: "contentType", id: undefined },
        fn: ({ model: view, fullId, format }) =>
          fullId && fields[fullId]
            ? { format, ...fields[fullId], ...view }
            : { format, ...view },
        viewFormat: view.format || "view",
      })
    );

    contentType.views = arr2Obj(populatedViews, "name");
    return contentType;
  });

  return populatedViews;
};

module.exports = (app) => {
  app.on("init", 1000, () => {
    app.populatedViews = populateViews({ app });
    app.replaceInModel = replaceInModel;
  });
};
