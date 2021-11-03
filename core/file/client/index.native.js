import { AsyncStorage, FileSystem } from "react-native";
module.exports = (app) => {
  app.storage = app.addeventhandler(
    {},
    [
      "getItem",
      "setItem",
      "removeItem",
      "getItemMem",
      "setItemMem",
      "removeItemMem",
      "getFile",
      "setFile",
      "removeFile",
      "setItemDebounce",
    ],
    "storage"
  );

  app.storage.on("getItem", (data) => {
    return AsyncStorage.getItem(data.id).then((val) =>
      Object.assign(data, {
        value:
          val && (val[0] === "[" || val[0] === "{") ? JSON.parse(val) : val,
      })
    );
  });

  app.storage.on("setItem", (data) => {
    const val = data.value;
    return AsyncStorage.setItem(
      data.id,
      typeof val === "string" ? val : JSON.stringify(val)
    ).then(() => undefined);
  });

  let timer = {};
  app.storage.on("setItemDebounce", ({ id, value, delay }) => {
    clearTimeout(timer[id]);
    timer[id] = setTimeout(() => {
      delete timer[id];
      app.storage.setItem({ id, value });
    }, delay);
  });

  app.storage.on("removeItem", ({ id }) =>
    AsyncStorage.removeItem(id).then(() => undefined)
  );

  const memstore = {};

  app.storage.on("getItemMem", (data) =>
    Object.assign(data, { value: memstore[data.id] })
  );

  app.storage.on("setItemMem", ({ id, value }) => {
    memstore[id] = value;
  });

  app.storage.on("removeItemMem", ({ id }) => {
    delete memstore[id];
  });

  const baseURL =
    (app.settings.secure ? "https://" : "http://") + app.settings.domain;

  app.storage.on("getFile", (data) =>
    FileSystem.getInfoAsync(FileSystem.documentDirectory + data.id, {}).then(
      (response) =>
        Object.assign(data, {
          size: response.size,
          value: response.exists ? response.uri : null,
        })
    )
  );

  app.storage.on("setFile", ({ id, value }) => {
    const callback = (downloadProgress) => {
      const progress =
        downloadProgress.totalBytesWritten /
        downloadProgress.totalBytesExpectedToWrite;
      console.log(progress);
    };

    const downloadResumable = FileSystem.downloadResumable(
      baseURL + id,
      FileSystem.documentDirectory + value,
      {},
      callback
    );

    downloadResumable
      .downloadAsync()
      .then(({ uri }) => {
        console.log("Finished downloading to ", uri);
      })
      .catch((error) => {
        console.error(error);
      });

    downloadResumable
      .pauseAsync()
      .then(() => {
        console.log("Paused download operation, saving for future retrieval");
        AsyncStorage.setItem(
          "pausedDownload",
          JSON.stringify(downloadResumable.savable())
        );
      })
      .catch((error) => {
        console.error(error);
      });

    downloadResumable
      .resumeAsync()
      .then(({ uri }) => {
        console.log("Finished downloading to ", uri);
      })
      .catch((error) => {
        console.error(error);
      });
  });

  app.storage.on("removeFile", ({ id }) =>
    FileSystem.deleteAsync(FileSystem.documentDirectory + id, {})
  );
};
