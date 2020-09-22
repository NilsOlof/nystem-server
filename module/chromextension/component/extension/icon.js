const extensionIcon = props => {
  const { browserAction } = window.chrome;
  const { color, text, icon, canvas } = props.model || props;
  if (icon) browserAction.setIcon({ path: icon });
  if (color) browserAction.setBadgeBackgroundColor({ color }); // [190, 190, 190, 230]
  if (text) browserAction.setBadgeText({ text });
  if (canvas) {
    const canvasContext = canvas.getContext("2d");
    browserAction.setIcon({
      imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
    });
  }
  return null;
};
module.exports = extensionIcon;
