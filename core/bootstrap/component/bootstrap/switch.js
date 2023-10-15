import { useState, useEffect, useRef } from "react";
import app from "nystem";
import { ContentTypeRender, Wrapper, PanelContext } from "nystem-components";

const BootstrapSwitch = ({ model, path }) => {
  const { item, header, className, expandedClass } = model;
  const [expanded, setSexpanded] = useState(false);
  const panelElement = useRef(null);

  const toggleExpand = () => {
    setSexpanded(!expanded);
    app().stateStore.set(panelElement, !expanded, model.stateStore);
  };

  useEffect(() => {
    const storedState = app().stateStore.get(panelElement, model.stateStore);
    if (storedState === null || storedState === expanded) return;
    setSexpanded(storedState);
  }, [expanded, model.stateStore]);

  return (
    <Wrapper
      ref={panelElement}
      className={expanded ? expandedClass : className}
    >
      <PanelContext.Provider value={{ toggleExpand, expanded }}>
        <ContentTypeRender path={path} items={expanded ? item : header} />
      </PanelContext.Provider>
    </Wrapper>
  );
};

export default BootstrapSwitch;
