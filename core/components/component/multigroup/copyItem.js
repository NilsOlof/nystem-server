import React, { useRef, useState } from "react";
import app from "nystem";
import { Button, Icon } from "nystem-components";
import "./copyItem.css";

const MultigroupCopyItem = ({ model, value = [], path, view, setValue }) => {
  const ref = useRef();
  const [active, setActive] = useState(false);

  const doCopyVal = () => {
    const { current } = ref;
    current.value = JSON.stringify(value, null, "  ");
    current.style.display = "block";
    current.select();
    try {
      console.log("copy text");
      document.execCommand("copy");
      current.blur();
      current.style.display = "none";
    } catch (err) {
      console.log("please press Ctrl/Cmd+C to copy");
    }
    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 200);
  };

  const doPasteVal = () => {
    navigator.clipboard.readText().then((clipText) => {
      const clipVal = JSON.parse(clipText);
      if (!/\.[0-9]+$/im.test(path)) {
        if (clipVal instanceof Array) setValue([...clipVal, ...value]);
        else setValue([clipVal, ...value]);
        return;
      }
      const parts = path.split(".");
      const valPath = parts.slice(0, parts.length - 1).join(".");
      const parentVal = [...view.getValue(valPath)];
      try {
        parentVal.splice(parts[parts.length - 1], 0, clipVal);

        view.setValue({ path: valPath, value: parentVal });
        // eslint-disable-next-line no-empty
      } catch (e) {}
    });
    setActive(true);
    setTimeout(() => {
      setActive(false);
    }, 200);
  };

  return (
    <>
      <textarea
        className="bg-black"
        ref={ref}
        style={{
          display: "none",
          position: "absolute",
        }}
        readOnly={true}
      />
      <Button
        renderAs="button"
        className={[...(model.className || []), active ? "copyItemBounce" : ""]}
        type={model.btnType}
        onClick={model.direction === "paste" ? doPasteVal : doCopyVal}
        size={model.btnSize}
        title={model.direction}
      >
        {["copy", "paste"].includes(model.text) ? (
          <Icon className="h-6 w-6" icon={model.text} alt={model.text} />
        ) : (
          app().t(model.text)
        )}
      </Button>
    </>
  );
};

export default MultigroupCopyItem;
