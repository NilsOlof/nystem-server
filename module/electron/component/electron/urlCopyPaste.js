import React, { useRef } from "react";
import { Button, Wrapper, Icon } from "nystem-components";
import { useLocation, useHistory } from "react-router-dom";
import app from "nystem";

const ElectronUrlCopyPaste = ({ model, ...rest }) => {
  const { className, btnType, paste, text, size, title } = model || rest;
  const history = useHistory();
  const location = useLocation();
  const ref = useRef();

  const doCopy = () => {
    const { current } = ref;
    current.value = `http${app().settings.secure ? "s" : ""}://${
      app().settings.domain
    }${location.pathname}`;

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
  const doPaste = async () => {
    const { pathname } = new URL(await navigator.clipboard.readText());
    history.push(pathname);
  };

  return (
    <Wrapper>
      <Button
        className={className}
        type={btnType}
        onClick={() => (paste ? doPaste() : doCopy())}
        size={size}
      >
        <Icon
          className="w-4 h-4"
          icon={paste ? "paste" : "edit-copy"}
          title={title}
        />
        <Wrapper className={text && "ml-2 flex"}>{text || ""}</Wrapper>
      </Button>
      <textarea
        ref={ref}
        style={{
          display: "none",
          position: "absolute",
        }}
        readOnly={true}
      />
    </Wrapper>
  );
};

export default ElectronUrlCopyPaste;