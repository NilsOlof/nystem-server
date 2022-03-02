const extensionIcon = (props) => {
  const { browserAction } = window.chrome;
  const { color, text, icon, canvas } = props.model || props;
  if (icon) browserAction.setIcon({ path: icon });
  if (color) browserAction.setBadgeBackgroundColor({ color }); // [190, 190, 190, 230]
  if (text) browserAction.setBadgeText({ text });
  if (canvas) {
    const canvasContext = canvas.getContext("2d");
    browserAction.setIcon({
      imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height),
    });
  }
  return null;
};
module.exports = extensionIcon;
/*
chrome.devtools.inspectedWindow.eval('<your code>', {
    useContentScriptContext: true
}, function(result) {
    // result of the execution
});

{
  "manifest_version": 2,

  "name": "Osudio Dev Tools",
  "version": "0.1",

  "description": "Frontend Developer Tools for Osudio",
  "author": "Osudio Frontend Team",

  "devtools_page": "html/devtools.html"
}

/html/devtools.html
This page only needs to contain a script, from which you will create the panel.

<!DOCTYPE html>
<html>
  <head>
    <script src="/js/devtools.js"></script>
  </head>
</html>

devtools.js.
chrome.devtools.panels.create('Osudio', null, '/html/panel.html', null);

https://developer.chrome.com/docs/extensions/mv3/devtools/
*/
