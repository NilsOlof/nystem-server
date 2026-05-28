import React, { useEffect, useRef, useState } from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";
import { AccessibilityInfo } from "react-native";

const OverlayAccessible = ({ children }) => {
  const [accessible, setAccessible] = useState(true);
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(false);
  const accessibleRef = useRef(accessible);

  useEffect(() => {
    accessibleRef.current = accessible;
  }, [accessible]);

  useEffect(() => {
    const overlayEvent = (options) => {
      const accessible = !Object.keys(options.open).length;
      if (accessibleRef.current !== accessible) setAccessible(accessible);
    };
    const handleScreenReaderToggled = (isEnabled) => {
      setScreenReaderEnabled(isEnabled);
    };

    app().on("overlay", overlayEvent);
    AccessibilityInfo.addEventListener("change", handleScreenReaderToggled);
    AccessibilityInfo.fetch().done((isEnabled) => {
      setScreenReaderEnabled(isEnabled);
    });

    return () => {
      app().off("overlay", overlayEvent);
      AccessibilityInfo.removeEventListener("change", handleScreenReaderToggled);
    };
  }, []);

  if (!accessible && screenReaderEnabled) return null;
  return (
    <Wrapper accessible={accessible ? undefined : false}>{children}</Wrapper>
  );
};

export default OverlayAccessible;
