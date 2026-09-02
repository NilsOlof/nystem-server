import React, { useState, useEffect, useRef } from "react";
import { Wrapper, PanelContext } from "nystem-components";
import app from "nystem";

const types = {
  default: {
    wrapper:
      "mb-4 border border-gray-700 shadow-lg rounded-lg overflow-hidden bg-gray-900",
    body: "p-3 bg-black",
    header:
      "bg-gray-800 text-gray-200 border-b border-gray-700 pointer py-2 px-3",
  },
  primary: {
    wrapper:
      "mb-4 border border-blue-700 shadow-lg rounded-lg overflow-hidden bg-blue-700",
    body: "p-3 bg-black",
    header: "text-white pointer py-2 px-3",
  },
  defaultWithoutPadding: {
    wrapper:
      "mb-4 border border-gray-700 shadow-lg rounded-lg overflow-hidden bg-gray-900",
    body: "bg-black",
    header:
      "bg-gray-800 text-gray-200 border-b border-gray-700 pointer py-1 px-2",
  },
  compact: {
    wrapper: "block border-l-2 border-gray-700 bg-gray-900",
    body: "pl-3",
    header: "text-gray-300 px-2 py-1",
  },
};

const Panel = ({ body, header, className, ...props }) => {
  const [expanded, setSexpanded] = useState(props.expanded);
  const panelElement = useRef(null);

  const toggleExpand = () => {
    setSexpanded(!expanded);
    app.stateStore.set(panelElement, !expanded, props.stateStore);
  };

  useEffect(() => {
    const storedState = app.stateStore.get(panelElement, props.stateStore);
    if (storedState === null || storedState === expanded) return;
    setSexpanded(storedState);
  }, [expanded, props.stateStore]);

  const type = types[props.type || "default"];

  return (
    <Wrapper ref={panelElement} className={[type.wrapper, className]}>
      <Wrapper className={type.header}>
        <PanelContext.Provider value={{ toggleExpand, expanded }}>
          {header}
        </PanelContext.Provider>
      </Wrapper>
      {expanded ? (
        <Wrapper className={type.body}>{body}</Wrapper>
      ) : props.visibilityHidden ? (
        <Wrapper className={[type.body, "hidden"]}>{body}</Wrapper>
      ) : null}
    </Wrapper>
  );
};

export default Panel;
