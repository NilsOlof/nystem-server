import React, { useEffect, useState } from "react";
import { ViewportContextProvider } from "./viewportContext";

const breakpoints = {
  xs: 0,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
};

const Viewport = ({ comp }) => {
  const [state, setState] = useState({
    density: window.devicePixelRatio,
    width: window.innerWidth,
    height: window.innerHeight,
    size: Object.keys(breakpoints).reduce((prev, key) => {
      return window.innerWidth < breakpoints[key] &&
        breakpoints[key] < breakpoints[prev]
        ? key
        : prev;
    }, "xl"),
  });

  useEffect(() => {
    const handleResize = () => {
      setState({
        width: Math.max(
          document.documentElement.clientWidth,
          window.innerWidth || 0
        ),
        height: Math.max(
          document.documentElement.clientHeight,
          window.innerHeight || 0
        ),
        size: Object.keys(breakpoints).reduce((prev, key) => {
          return window.innerWidth < breakpoints[key] &&
            breakpoints[key] < breakpoints[prev]
            ? key
            : prev;
        }, "xl"),
      });
    };

    window.addEventListener("resize", handleResize, false);

    return () => {
      window.removeEventListener("resize", handleResize, false);
    };
  }, []);

  return state.reload ? null : (
    <ViewportContextProvider value={state}>
      {React.createElement(comp)}
    </ViewportContextProvider>
  );
};

export default Viewport;
