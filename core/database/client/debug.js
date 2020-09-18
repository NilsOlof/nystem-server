/*
function getStackTrace(row) {
  const obj = {};
  Error.captureStackTrace(obj, getStackTrace);
  if (row) return obj.stack.split("\n")[row].replace("   at ", "");
  return obj.stack;
}
*/
module.exports = app => {
  app.database.on("init", ({ collection, db }) => {
    /*
    ["delete", "find", "get", "save", "search", "size"].forEach(event => {
      collection.on(
        event,
        query => {
          console.log(event, query, getStackTrace(6));
        },
        1002
      );
    });*/
  });
};
