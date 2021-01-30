module.exports = function (app) {
  app.connection.on("emit", async (data) => {
    if (haveConnected === true) return;
    // console.log("f emit");
    data = fetch("/httpsfallback", {
      method: "post",
      body: JSON.stringify(data),
    }).then((response) => response.json());
    return data;
  });

  let haveConnected = false;
  app.connection.on("connect", (data) => {
    // console.log("f connect");
    haveConnected = true;
  });

  app.connection.on("disconnect", (data) => {
    haveConnected = false;
  });

  /*
  setTimeout(() => {
    app.connection.event("connect", { type: "connect" });
  }, 1000);
  */
};
