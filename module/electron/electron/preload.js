const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electron", {
  send: (msg) => ipcRenderer.send("msg", msg),
  on: (callback) => ipcRenderer.on("msg", callback),
  off: (callback) => ipcRenderer.removeListener("msg", callback),
});
