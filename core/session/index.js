export default async (app) => {
  await app.require("./session");
  await app.require("./password");
  await app.require("./access");
};
