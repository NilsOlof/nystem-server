import React, { useEffect, useState } from "react";
import { Wrapper } from "nystem-components";

const OverlayOverlay = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const add = mounted ? "--active" : "";
  return (
    <Wrapper className={`overlay-background overlay-background${add}`}>
      <Wrapper className={`overlay-contents overlay-contents${add}`}>
        {children}
      </Wrapper>
    </Wrapper>
  );
};

export default OverlayOverlay;
