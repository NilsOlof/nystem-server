import React, { useRef } from "react";
import app from "nystem";
import { Button, Icon } from "nystem-components";

const CopyToClipBoardView = ({ model, value }) => {
  const ref = useRef();
  const doVopyVal = (e) => {
    if (
      e &&
      ((e.altKey && !model.gotoOnClick) || (!e.altKey && model.gotoOnClick))
    ) {
      window.open(copyVal, "_blank").focus();
      return;
    }

    const { current } = ref;
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
  };

  let copyVal = model.field ? value[model.field] : value;
  if (typeof copyVal === "object")
    copyVal = JSON.stringify(copyVal, null, "  ");
  if (model.addBefore) copyVal = model.addBefore + copyVal;

  return (
    <>
      <input
        ref={ref}
        style={{
          display: "none",
          position: "absolute",
        }}
        value={copyVal}
        readOnly={true}
      />
      <Button
        renderAs="button"
        className={model.className}
        type={model.btnType}
        onClick={doVopyVal}
        size={model.btnSize}
      >
        {["copy", "paste"].includes(model.text) ? (
          <Icon className="h-4 w-4" icon={model.text} alt={model.text} />
        ) : (
          app().t(model.text)
        )}
      </Button>
    </>
  );
};

export default CopyToClipBoardView;
