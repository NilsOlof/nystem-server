import React, { useEffect, useRef } from "react";
import { Button, Wrapper, Icon } from "nystem-components";

const ViewButtonUndoRedo = ({ model, view }) => {
  const { iconClassName, className } = model;
  const history = useRef([view.value]);
  const at = useRef(false);

  useEffect(() => {
    const onChange = ({ value, isHistory }) => {
      if (isHistory) return;

      if (at.current) history.current = history.current.slice(0, at.current);
      history.current.push(value);
      at.current = false;
    };
    view.on("change", -1000, onChange);
    return () => {
      view.off("change", onChange);
    };
  }, [view]);

  const IconButton = ({ icon, onClick }) => (
    <Button onClick={onClick} type={model.btnType} size={model.btnSize}>
      <Icon className={iconClassName || "h-6 w-6"} icon={icon} />
    </Button>
  );

  return (
    <Wrapper className={className}>
      <IconButton
        icon="undo"
        onClick={() => {
          const atPos = at.current || history.current.length - 1;

          const value = history.current[atPos - 1];
          if (value) view.event("change", { value, isHistory: true });
          if (atPos) at.current = atPos - 1;
        }}
      />
      <IconButton
        icon="redo"
        onClick={() => {
          if (!at.current || at.current === history.current.length - 1) return;

          const value = history.current[at.current + 1];
          if (value) view.event("change", { value, isHistory: true });
          if (at.current !== history.current.length - 1) at.current += 1;
        }}
      />
    </Wrapper>
  );
};

export default ViewButtonUndoRedo;
