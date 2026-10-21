import "./background-shim.js";
import app from "nystem";

console.log("[chromextension bg] loading app", new Date().toISOString());

chrome.runtime.onInstalled.addListener(() => {
  console.log("[chromextension bg] installed/reloaded");
  app.event("extensionInstalled");
});

chrome.runtime.onStartup.addListener(() => {
  console.log("[chromextension bg] startup");
  app.event("extensionStartup");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  app
    .event("extensionMessage", { message, sender })
    .then((response) => sendResponse(response || { ok: true }))
    .catch((error) => {
      console.error("[chromextension bg] message failed", error);
      sendResponse({ ok: false, error: error.message });
    });

  return true;
});
