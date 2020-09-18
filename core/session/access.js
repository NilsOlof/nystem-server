module.exports = function(app) {
  app.on("init", () => {
    app.database.on("init", ({ collection, contentType }) => {
      const roles = contentType._roles || {};
      const { name } = contentType;

      const calls = ["save", "find", "delete", "search", "get"];

      calls.forEach(type => {
        roles[type] = roles[type] || [];

        if (roles[type].includes("all")) return;

        collection.on(type, 990, query => {
          const role = query.session ? query.session.role : query.role || "";
          query.role = role;

          if (role === "super" || roles[type].includes(role)) return;

          console.log(`block ${type}`, name, role);
          query.data = false;
        });
      });
    });
  });
};
