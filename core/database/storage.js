module.exports = (app) => {
  app.database.on("init", ({ collection, db, contentType }) => {
    const { fs } = app;
    let dbFile = app.dbPath
      ? app.dbPath
      : `${app.__dirname}/data/db/${contentType.machinename}`;
    if (["module", "moduleThreaded"].includes(contentType.storage)) {
      dbFile = `${app.__dirname}/module/${contentType.module}/db/${contentType.machinename}`;
      if (!fs.existsSync(dbFile)) fs.mkdirSync(dbFile);
    }

    function loadData() {
      let dbArray = [];
      if (fs.existsSync(`${dbFile}db.json`)) {
        try {
          console.time(`load ${contentType.machinename}`);
          dbArray = JSON.parse(fs.readFileSync(`${dbFile}db.json`, "utf8"));
          console.timeEnd(`load ${contentType.machinename}`);
        } catch (e) {
          dbArray = [];
        }
      } else if (fs.existsSync(`${dbFile}Old.json`)) {
        console.log(`Load old data ${dbFile}`);
        try {
          dbArray = JSON.parse(fs.readFileSync(`${dbFile}Old.json`, "utf8"));
        } catch (e) {}
      }
      return dbArray;
    }

    let delayTimer3 = false;
    let delayTimer30 = false;
    function saveDB() {
      function _saveDB() {
        console.log("save", contentType.machinename);

        clearTimeout(delayTimer30);
        delayTimer3 = false;
        delayTimer30 = false;
        const data = app.debug
          ? JSON.stringify(db.dbArray, null, "\t")
          : JSON.stringify(db.dbArray);

        fs.writeFile(`${dbFile}temp.json`, data, (err) => {
          if (!err) {
            if (fs.existsSync(`${dbFile}Old.json`))
              fs.unlinkSync(`${dbFile}Old.json`);
            if (fs.existsSync(`${dbFile}db.json`))
              fs.rename(`${dbFile}db.json`, `${dbFile}Old.json`, (err) => {
                if (!err)
                  fs.rename(`${dbFile}temp.json`, `${dbFile}db.json`, (err) => {
                    if (!err) fs.unlink(`${dbFile}Old.json`);
                  });
              });
            else fs.rename(`${dbFile}temp.json`, `${dbFile}db.json`);
          }
        });
      }
      if (delayTimer30) clearTimeout(delayTimer3);
      else {
        delayTimer3 = setTimeout(_saveDB, 3000);
        delayTimer30 = setTimeout(_saveDB, 30000);
      }
    }

    if (!["memory", "memoryThreaded"].includes(contentType.storage))
      collection.on(["save", "delete"], -900, (query) =>
        query.data ? saveDB() : undefined
      );

    collection.on("init", 1000, (query) => {
      // console.log(collection.contentType.machinename, data.value);
      db.dbArray = loadData();
    });
  });
};
