module.exports = async (app) => {
  if (!app.fs.existsSync(`${app.__dirname}/web`)) return;

  const paths = app.filePaths.filter((path) => {
    const parts = path.split("/");
    return parts[2] === "icons" && parts[3].includes(".svg");
  });

  const icons = await Promise.all(
    paths.map(async (path) => ({
      text: await app.fs.readFile(`${app.__dirname}/${path}`, "utf8"),
      file: path.split("/")[3].replace(".svg", ""),
    }))
  );

  const byType = icons
    .map((item) => ({
      ...item,
      text: item.text.replace(/<\/?svg[^>]*>/gi, "").replace(/[\r\n]/gi, ""),
    }))
    .reduce(
      (res, curr) => ({
        ...res,
        [curr.file]: curr.text,
      }),
      {}
    );

  await app.fs.writeFile(
    `${app.__dirname}/web/src/icons.js`,
    `/* eslint-disable */
    import React from "react";
  
  export default ${JSON.stringify(byType)
    .replace(/"</g, "<")
    .replace(/>"/g, ">")
    .replace(/\\/g, "")}`
  );

  const viewPorts = icons
    .map((item) => ({
      ...item,
      viewPort: / viewBox="([^"]+)"/gim.exec(item.text)[1],
    }))
    .filter((item) => item.viewPort !== "0 0 20 20")
    .reduce(
      (res, curr) => ({
        ...res,
        [curr.file]: curr.viewPort,
      }),
      {}
    );

  await app.fs.writeFile(
    `${app.__dirname}/web/src/iconsViewPorts.js`,
    `/* eslint-disable */
    export default ${JSON.stringify(viewPorts)}`
  );

  app.icons = {};
};
