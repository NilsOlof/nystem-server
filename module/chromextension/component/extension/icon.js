const ExtensionIcon = (props) => {
  const { action } = window.chrome;
  const { color, text, icon, canvas } = props.model || props;
  if (!action) return null;
  if (icon) action.setIcon({ path: icon });
  if (color) action.setBadgeBackgroundColor({ color }); // [190, 190, 190, 230]
  if (text) action.setBadgeText({ text });
  if (canvas) {
    const canvasContext = canvas.getContext("2d");
    action.setIcon({
      imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height),
    });
  }
  return null;
};
export default ExtensionIcon;
