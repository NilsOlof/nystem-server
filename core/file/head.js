module.exports = (app) => {
  app.on("start", () => {
    app.file.on("head", ({ id, type }) => {
      app.file.event("response", {
        id,
        type,
        headers: {},
        data: "",
        closed: true,
      });

      return {};
    });
  });
};
