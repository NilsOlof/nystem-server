import React, { useEffect, useRef, useState } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const OverlayAccessible = ({ children }) => {
  const [accessible, setAccessible] = useState(true);
  const accessibleRef = useRef(accessible);
  const accessibleId = useRef();

  useEffect(() => {
    accessibleRef.current = accessible;
  }, [accessible]);

  useEffect(() => {
    accessibleId.current = app().uuid();

    const overlayEvent = (options) => {
      const accessible = !Object.keys(options.open).length;
      if (accessibleRef.current !== accessible) {
        setAccessible(accessible);
        app().event("accessible", {
          accessible,
          accessibleId: accessibleId.current,
        });
      }
    };

    app().on("overlay", overlayEvent);
    return () => app().off("overlay", overlayEvent);
  }, []);

  return (
    <Wrapper accessible={accessible ? undefined : false}>{children}</Wrapper>
  );
};

export default OverlayAccessible;
