import React, { useState, useEffect, useRef } from "react";
import { Wrapper, PanelContext } from "nystem-components";
import app from "nystem";

const types = {
  default: {
    wrapper: "mb-3 border shadow rounded",
    body: "p-3",
    header: "bg-gray-200 pointer p-1 pl-3",
  },
  primary: {
    wrapper: "mb-3 border shadow rounded bg-blue-600 border-blue-600",
    body: "p-3 bg-white rounded",
    header: "text-white pointer p-1 pl-3",
  },
  defaultWithoutPadding: {
    wrapper: "mb-3 border shadow rounded",
    body: "",
    header: "bg-gray-200 pointer pl-2 pr-1",
  },
  compact: {
    wrapper: "mb-1",
    body: "",
    header: "",
  },
};

const Panel = ({ body, header, className, ...props }) => {
  const [expanded, setSexpanded] = useState(props.expanded);
  const panelElement = useRef(null);

  const toggleExpand = () => {
    setSexpanded(!expanded);
    app().stateStore.set(panelElement, !expanded, props.stateStore);
  };

  useEffect(() => {
    const storedState = app().stateStore.get(panelElement, props.stateStore);
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
