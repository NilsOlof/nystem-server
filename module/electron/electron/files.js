const { dialog } = require("electron");
const http = require("http");
const https = require("https");

const fetch = (url) =>
  new Promise((resolve, reject) => {
    const call = url.startsWith("https://") ? https.get : http.request;

    call(url, (response) => {
      if (response.statusCode !== 200) {
        reject("missing");
        return;
      }

      let output = Buffer.alloc(0);

      response.on("data", (data) => {
        output = Buffer.concat([output, data]);
      });

      response.on("end", () => {
        resolve(output);
      });

      response.on("error", (error) => {
        console.log(error);
        reject(error);
      });
    })
      .on("error", (error) => {
        console.log("req", error);
        reject(error);
      })
      .end();
  });

const folders = {};

module.exports = async (app) => {
  app.on("electronData", async ({ event, ...rest }) => {
    if (event !== "dialog") return;

    const res = await dialog.showOpenDialog({
      properties: ["openFile", "openDirectory"],
    });
    res.filePaths.forEach((path) => {
      folders[path] = true;
    });

    return { event, ...res, ...rest };
  });

  app.on("electronData", async ({ event, file, path, domain, ...rest }) => {
    if (event !== "syncFile" || !folders[path] || !domain) return;

    let data = typeof file !== "string" ? file.data : false;
    const fileName = data ? file.fileName : file;

    if (!data && !app.fs.existsSync(`${path}/${fileName}`))
      try {
        data = await fetch(`${domain}/${file}`);
      } catch (e) {
        console.log("error", fileName);
      }

    if (!data) return;

    try {
      await app.fs.ensureFile(`${path}/${fileName}`);
      await app.fs.writeFile(`${path}/${fileName}`, Buffer.from(data));
    } catch (e) {
      console.log("error", e, fileName);
    }
  });
};
