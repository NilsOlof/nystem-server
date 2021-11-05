const crypto = require("crypto");

const md5 = (text) => crypto.createHash("md5").update(text).digest("hex");
let encryptPassword = (password, salt) => {
  try {
    const encrypt = crypto.createCipheriv("BF-ECB", salt, "");

    let hex = encrypt.update(md5(password), "ascii", "hex");
    hex += encrypt.final("hex");
    return hex;
  } catch (e) {
    return false;
  }
};
let checkPassword = (inPassword, bdPassword, salt) =>
  bdPassword === encryptPassword(inPassword, salt);

module.exports = (app) => {
  if (app.settings.bcryptjs) {
    const bcrypt = require("bcryptjs");

    const encryptPasswordOld = encryptPassword;
    encryptPassword = (password) => bcrypt.hashSync(password, 12);

    checkPassword = (inPassword, bdPassword, salt) =>
      bcrypt.compareSync(inPassword, bdPassword) ||
      (bdPassword === encryptPasswordOld(inPassword, salt) && "old");
  }

  app.on("init", () => {
    app.database.on("init", ({ collection, contentType, db }) => {
      if (
        !contentType._features ||
        contentType._features.indexOf("password") === -1
      )
        return;

      collection.on(["get", "search", "find"], 990, (query) => {
        if (!query.data) return;
        query.data = JSON.parse(JSON.stringify(query.data));
        if (query.data instanceof Array)
          for (let i = 0; i < query.data.length; i++)
            delete query.data[i].password;
        else delete query.data.password;
      });

      collection.on("save", ({ data = {}, oldData = {}, session = {} }) => {
        if (data.role === oldData.role && data.password === oldData.password)
          return;
        if (session._id === data._id) return;

        app.session.logout(data);
      });

      collection.on("save", 990, (query) => {
        if (!query.data) return;

        const { _id, password } = query.data;

        if (_id) {
          if (typeof password === "string" && password.length > 2)
            query.data.password = encryptPassword(password, _id);
          else
            query.data.password = query.oldData ? query.oldData.password : "aa";
        } else {
          query.data._id = app.uuid();
          query.data.password = encryptPassword(password, query.data._id);
        }
      });

      let loginField = false;
      collection.contentType.item.forEach((item) => {
        if (["login", "email"].indexOf(item.id) !== -1) loginField = item.id;
      });
      if (!loginField) return;

      collection.checkPassword = (data) => collection.on("checkPassword", data);

      collection.on("checkPassword", async (data) => {
        const value = data.email || data.login;
        if (!value) return { ...data, error: "missing" };

        const query = await collection.find({
          field: loginField,
          value,
          role: "super",
        });

        const user = query.data;
        if (!user) return { ...data, error: "missing" };
        if (!data.password) return { ...data, error: "password" };

        const valid = checkPassword(
          data.password,
          db.dbIndex[user._id].password,
          user._id
        );

        if (valid === "old")
          await collection.save({
            data: { ...user, password: data.password },
            role: "super",
          });

        return valid ? { ...data, user } : { ...data, error: "password" };
      });
    });
  });
};
