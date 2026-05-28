import React, { useRef, useState } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const ViewTextCopyContent = ({ model, path, view }) => {
  const ref = useRef();
  const refSrc = useRef();
  const [active, setActive] = useState(false);

  const doCopyVal = () => {
    const { current } = ref;
    current.value = !model.value
      ? refSrc.current.innerText
      : app.insertVal(model.value, view, path);

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
      <Wrapper
        ref={refSrc}
        className={[
          model.className,
          active && "copyItemBounce",
          "cursor-pointer",
        ]}
        onClick={doCopyVal}
      >
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    </>
  );
};

export default ViewTextCopyContent;
