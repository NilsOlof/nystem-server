import React, { useRef } from "react";
import app from "nystem";
import { Button } from "nystem-components";

const CopyToClipBoardView = ({ model, value }) => {
  const ref = useRef();
  const doVopyVal = (e) => {
    if ((e.altKey && !model.gotoOnClick) || (!e.altKey && model.gotoOnClick)) {
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

  let copyVal = value[model.field];
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
        {app().t(model.text)}
      </Button>
    </>
  );
};

export default CopyToClipBoardView;
