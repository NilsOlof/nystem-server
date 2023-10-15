const hourInMs = 1000 * 60 * 60;

module.exports = (app) => {
  const { fs } = app;
  const stringify =
    app.debug && !app.settings.spacelessDb
      ? (data) => JSON.stringify(data, null, "\t")
      : (data) => JSON.stringify(data);

  let resave = false;

  const rmLast = (contents) => {
    let pos = contents.length;
    let ch;
    while (!"[]{}".includes(ch) && pos > 0) ch = contents[--pos];

    if (ch !== "]") return contents;
    resave = true;
    return contents.substring(0, pos);
  };

  app.eventStorageFile = (path, deFaultVal = []) => {
    let compress = false;
    const waitName = `eventStorageFile${path}`;
    app.waitInLine.init(waitName);

    fs.ensureDir(path.split("/").slice(0, -1).join("/"));

    const load = (path) => {
      try {
        if (!fs.existsSync(path)) return false;
        const stTime = performance.now();

        const result = JSON.parse(`${rmLast(fs.readFileSync(path, "utf8"))}]`);
        result.reverse();
        const ids = {};
        const data = result.filter((item) => {
          if (ids[item._id]) return false;
          ids[item._id] = true;
          if (item.__deleted) return false;
          return true;
        });
        data.reverse();

        console.log(
          `ev load ${path} ${(performance.now() - stTime).toFixed(2)}ms`
        );
        return data;
      } catch (e) {
        console.log(e);
        return false;
      }
    };

    let data =
      load(`${path}0.json`) || load(`${path}1.json`) || load(`${path}.json`);

    if (!data) {
      console.log(`ev load ${path} deFaultVal`);
      data = deFaultVal;
    }

    const saveFile = () => {
      const stTime = performance.now();
      app.waitInLine.waitInLine(waitName, () =>
        fs.writeFile(`${path}.json`, rmLast(stringify(data)))
      );
      console.log(
        `Save full ${path} ${(performance.now() - stTime).toFixed(2)}ms`
      );
    };
    if (resave) saveFile();

    setInterval(() => {
      if (!compress) return;
      saveFile();
      compress = false;
    }, hourInMs * 4 + Math.trunc((Math.random() * hourInMs) / 4));

    const appendFile = async (allData, item) => {
      data = allData;
      if (data.length < 5) return saveFile();

      compress = true;

      const stTime = performance.now();
      await app.waitInLine.waitInLine(waitName, () =>
        fs.appendFile(`${path}.json`, `,${stringify(item)}`)
      );
      console.log(`Save ${path} ${(performance.now() - stTime).toFixed(2)}ms`);
    };

    return {
      get: () => data,
      save: (allData, item) => appendFile(allData, item),
      delete: (allData, _id) => appendFile(allData, { _id, __deleted: true }),
    };
  };
};
