window.addEventListener("message", ({ source, data }) => {
  if (source === window && data.nystem === "from")
    window.chrome.runtime.sendMessage(data);
});

window.chrome.runtime.onMessage.addListener((message) => {
  if (message.nystem === "to") window.postMessage(message, "*");
});
