const hourInMs = 1000 * 60 * 60;
import { constants } from "node:buffer";
import { StringDecoder } from "node:string_decoder";

export default async (app) => {
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
  const dbMaxStringLength =
    app.settings.dbMaxStringLength || constants.MAX_STRING_LENGTH;

  const parseFile = (path) => {
    const buffer = fs.readFileSync(path);
    if (dbMaxStringLength > buffer.length)
      return JSON.parse(`${rmLast(fs.readFileSync(path, "utf8"))}]`);

    let curlyCount = 0;
    let itemCount = 0;
    let out = [];
    let bufPos = 0;
    let pos = -1;
    let data = "";
    const buAddLen = dbMaxStringLength;

    const decoder = new StringDecoder("utf8");

    while (pos <= data.length + 1) {
      pos++;

      if (pos === data.length) {
        if (bufPos === buffer.length) continue;
        const form = bufPos;
        bufPos =
          buffer.length < bufPos + buAddLen ? buffer.length : bufPos + buAddLen;
        data += decoder.write(buffer.slice(form, bufPos));
      }

      if (data[pos] === "{") {
        curlyCount++;
      } else if (data[pos] === "}") {
        curlyCount--;
        if (curlyCount < 0) curlyCount = 0;

        if (curlyCount === 0) {
          itemCount++;

          if (itemCount > 300000) {
            try {
              const items = JSON.parse(
                `[${data.substring(data.indexOf("{"), pos + 1)}]`,
              );
              out = out.concat(items);
            } catch (e) {
              console.log(
                `fail ${path} ${itemCount} ${pos} ${buffer.length}`,
                e,
              );
            }

            data = data.substring(pos);
            pos = -1;
            itemCount = 0;
          }
        }
      }
    }

    try {
      const items = JSON.parse(
        `[${data.substring(data.indexOf("{"), pos + 1)}]`,
      );
      out = out.concat(items);
    } catch (e) {
      console.log(`fail at last ${path} ${itemCount} ${pos} ${data.length}`, e);
      console.log(`[${data.substring(pos - 20)}]`);
    }

    return out;
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

        const result = parseFile(path, "utf8");
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
          `ev load ${path} ${(performance.now() - stTime).toFixed(2)}ms`,
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
    const chunk = 400000;
    const saveFile = () => {
      const stTime = performance.now();
      app.waitInLine.waitInLine(waitName, async () => {
        if (data.length > chunk) {
          await fs.writeFile(
            `${path}.json`,
            rmLast(stringify(data.slice(0, chunk))),
          );

          let pos = 0;
          while (data.length > pos) {
            pos += data.length < pos + chunk ? data.length - pos : chunk;
            const saveData = data.slice(pos, pos + chunk);
            if (saveData.length)
              await fs.appendFile(
                `${path}.json`,
                `,${rmLast(stringify(saveData).substring(1))}`,
              );
          }
        } else await fs.writeFile(`${path}.json`, rmLast(stringify(data)));
      });
      console.log(
        `Save full ${path} ${(performance.now() - stTime).toFixed(2)}ms`,
      );
    };
    if (resave) saveFile();

    setInterval(
      () => {
        if (!compress) return;
        saveFile();
        compress = false;
      },
      hourInMs * 4 + Math.trunc((Math.random() * hourInMs) / 4),
    );

    const appendFile = async (allData, item) => {
      data = allData;
      if (data.length < 5) return saveFile();

      compress = true;

      const stTime = performance.now();
      await app.waitInLine.waitInLine(waitName, () =>
        fs.appendFile(`${path}.json`, `,${stringify(item)}`),
      );
      console.log(`Save ${path} ${(performance.now() - stTime).toFixed(2)}ms`);
    };

    return {
      get: () => data,
      save: (allData, item) => appendFile(allData, item),
      delete: (allData, _id) => appendFile(allData, { _id, __deleted: true }),
      saveFile,
    };
  };
};
