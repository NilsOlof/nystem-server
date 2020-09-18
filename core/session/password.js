module.exports = function(app) {
  const { utils } = app;
  app.on("init", () => {
    app.database.on("init", ({ collection, contentType, db }) => {
      if (
        !contentType._features ||
        contentType._features.indexOf("password") === -1
      )
        return;

      collection.on(["get", "search", "find"], 990, query => {
        if (!query.data) return;
        query.data = app.utils.clone(query.data);
        if (query.data instanceof Array)
          for (let i = 0; i < query.data.length; i++)
            delete query.data[i].password;
        else delete query.data.password;
      });

      collection.on("save", 990, query => {
        if (!query.data) return;
        if (query.data._id) {
          if (
            utils.exist(query.data.password) &&
            query.data.password.length > 2
          )
            query.data.password = utils.encryptPassword(
              utils.md5(query.data.password),
              query.data._id
            );
          else
            query.data.password = query.oldData ? query.oldData.password : "aa";
        } else {
          query.data._id = app.uuid();
          query.data.password = utils.encryptPassword(
            utils.md5(query.data.password),
            query.data._id
          );
        }
      });

      let loginField = false;
      collection.contentType.item.forEach(item => {
        if (["login", "email"].indexOf(item.id) !== -1) loginField = item.id;
      });
      if (!loginField) return;

      collection.checkPassword = data => collection.on("checkPassword", data);

      collection.on("checkPassword", async data => {
        const value = data.email || data.login;
        if (!value) return { ...data, error: "missing" };

        const query = await collection.find({
          field: loginField,
          value,
          role: "super"
        });

        const user = query.data;
        if (!user) return { ...data, error: "missing" };
        if (!data.password) return { ...data, error: "password" };

        const password = utils.encryptPassword(
          utils.md5(data.password),
          user._id
        );

        if (password !== db.dbIndex[user._id].password)
          return { ...data, error: "password" };

        return { ...data, user };
      });
    });
  });
};
