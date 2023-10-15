module.exports = (app) => {
  const { fs } = app;
  const stringify =
    app.debug && !app.settings.spacelessDb
      ? (data) => JSON.stringify(data, null, "\t")
      : (data) => JSON.stringify(data);

  app.debounceStorageFile = (path, deFaultVal) => {
    let delayTimer3 = false;
    let delayTimer30 = false;
    fs.ensureDir(path.split("/").slice(0, -1).join("/"));

    const load = (path) => {
      try {
        if (!fs.existsSync(path)) return false;
        const stTime = performance.now();
        const data = JSON.parse(fs.readFileSync(path, "utf8"));
        console.log(
          `load ${path} ${(performance.now() - stTime).toFixed(2)}ms`
        );
        return data;
      } catch (e) {
        return false;
      }
    };

    let data =
      load(`${path}.json`) ||
      load(`${path}Temp.json`) ||
      load(`${path}Old.json`) ||
      deFaultVal;
    const hasOld = data !== deFaultVal;

    const saveFile = async () => {
      const stTime = performance.now();

      const stTimePost = performance.now();
      clearTimeout(delayTimer30);
      delayTimer3 = false;
      delayTimer30 = false;

      await fs.writeFile(`${path}Temp.json`, stringify(data));
      if (hasOld) await app.fs.rename(`${path}.json`, `${path}Old.json`);
      await app.fs.rename(`${path}Temp.json`, `${path}.json`);
      if (hasOld) await app.fs.unlink(`${path}Old.json`);

      console.log(
        `Save ${path} ${data.length} ${(stTimePost - stTime).toFixed(2)}ms ${(
          performance.now() - stTimePost
        ).toFixed(2)}ms`
      );
    };
    app.on("exit", -50, async () => {
      if (delayTimer30 || delayTimer3) await saveFile();
    });

    const save = (newData) => {
      if (newData instanceof Array) data = [...newData];
      else data = newData;

      if (delayTimer30) clearTimeout(delayTimer3);
      else {
        delayTimer3 = setTimeout(saveFile, 3000);
        delayTimer30 = setTimeout(saveFile, 30000);
      }
    };
    return { get: () => data, save, delete: save };
  };
};
