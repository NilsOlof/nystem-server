const deleteM = require("./delete");
const findM = require("./find");
const getM = require("./get");
const initM = require("./init");
const saveM = require("./save");
const searchM = require("./search");

module.exports = (app) => {
  deleteM(app);
  findM(app);
  getM(app);
  initM(app);
  saveM(app);
  searchM(app);

  app.database.on(
    "init",
    ({ contentType }) => {
      const db = { dbArray: [], dbIndex: {} };

      const collection = app.addeventhandler(
        { contentType },
        [
          "delete",
          "find",
          "get",
          "init",
          "save",
          "search",
          "size",
          "update",
          "updates",
        ],
        `database ${contentType.machinename}`
      );

      collection.on("init", (query) => {
        const { dbArray, dbIndex } = db;
        dbArray.forEach((item) => {
          dbIndex[item._id] = item;
        });
      });

      collection.on("size", () => db.dbArray.length);
      return { collection, db, contentType };
    },
    1000
  );
};
