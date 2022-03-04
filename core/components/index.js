module.exports = (app) => {
  const addListner = ({ source, collection, fieldId }) => {
    if (!app.database[source] || !app.database[source].on) {
      console.error("Missing reference", source);
      return;
    }

    app.database[source].on("delete", (query) => {
      const { _id } = query.data;
      collection.search({ role: "super", count: 1000 }).then(({ data }) => {
        data = data || false;
        const removeFrom = data.filter((item) =>
          (item[fieldId] || []).includes(_id)
        );

        removeFrom.forEach((item) =>
          collection.save({
            role: "super",
            data: {
              ...item,
              [fieldId]: item[fieldId].filter((id) => id !== _id),
            },
          })
        );
      });
    });
  };

  app.on("init", () => {
    app.database.on("init", ({ collection, contentType }) => {
      contentType.item.forEach((item) => {
        if (item.type !== "reference") return;
        const fieldId = item.id;

        if (app.database[item.source])
          addListner({ source: item.source, collection, fieldId });
        else
          app.on("start", () =>
            addListner({ source: item.source, collection, fieldId })
          );
      });
    });
  });
};
