module.exports = (app) => {
  const validators = app.filePaths.reduce((res, item) => {
    const [, , isComponent, type, name] = item.split(/[/.]/);
    if (isComponent !== "component") return res;
    if (name !== "validate") return res;

    res[type] = require(`${app.__dirname}/${item}`);
    return res;
  }, {});

  const check = (item, value) => {
    const fields = item.map((item) => item.id);
    const errors = [];

    Object.keys(value).forEach((key) => {
      if (["_id", "_chdate", "_crdate"].includes(key)) return;
      if (value[key] === undefined) return;
      if (!fields.includes(key)) errors.push(`${key} extra field`);
    });

    item.forEach((item) => {
      if (
        validators[item.type] &&
        validators[item.type]({ model: item, value: value[item.id] })
      )
        errors.push(`${item.id} validate error`);
      if (!value[item.id]) return;

      if (item.type === "group") errors.push(check(item.item, value[item.id]));

      if (item.type === "multigroup")
        value[item.id].forEach((val) => errors.push(check(item.item, val)));
    });
    return errors;
  };

  app.database.on("init", ({ collection, contentType }) => {
    collection.on("save", -10, ({ noValidation, data }) => {
      if (!data || noValidation) return;
      const errors = check(contentType.item, data)
        .flat(Infinity)
        .filter((item) => item);

      if (errors.length)
        console.log(
          `Validation errors ${contentType.machinename} ${
            data._id
          }: ${errors.join(", ")}`
        );
    });
  });
};
