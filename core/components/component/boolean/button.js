import { Button, Icon } from "nystem-components";
import app from "nystem";

const classNames = (className) =>
  !className ? [] : className instanceof Array ? className : [className];

const BooleanButton = ({ setValue, model, value }) => {
  const [text, className = []] = (
    value ? model.text : model.falseText || model.text
  ).split(":");

  return (
    <Button
      type={value ? model.btnType : model.falseBtnType}
      size={model.size}
      className={[...classNames(className), ...classNames(model.className)]}
      onClick={() => setValue(!value)}
    >
      {[
        "code",
        "pause",
        "play",
        "folder",
        "gear",
        "wallet",
        "location-dot",
        "terminal-solid",
        "brands-github",
      ].includes(text) ? (
        <Icon className="h-4 w-4" icon={text} alt={text} />
      ) : (
        app().t(text)
      )}
    </Button>
  );
};

export default BooleanButton;
