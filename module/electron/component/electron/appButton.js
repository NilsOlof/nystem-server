import React, { useState } from "react";
import app from "nystem";
import { Button, Wrapper, Icon } from "nystem-components";

const ElectronAppButton = ({ model, ...rest }) => {
  const { className, btnType, button, buttonActive, size } = model || rest;
  const [active, setActive] = useState(false);

  if (!btnType)
    return (
      <Icon
        className={className}
        icon={active ? buttonActive || button : button}
        alt={button}
        onClick={() => {
          app().event("electronEvent", { event: "appButton", button, active });
          setActive(!active);
        }}
      />
    );

  return (
    <Wrapper className={className}>
      <Button
        type={btnType}
        onClick={() => {
          app().event("electronEvent", { event: "appButton", button });
          setActive(!active);
        }}
        size={size}
      >
        <Icon
          className="w-4 h-4"
          icon={active ? buttonActive || button : button}
          alt={button}
        />
      </Button>
    </Wrapper>
  );
};

export default ElectronAppButton;
