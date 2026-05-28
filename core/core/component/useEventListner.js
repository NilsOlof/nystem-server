import { useState, useEffect } from "react";
import app from "nystem";

const useEventListner = (handler, event) => {
  const [result, setResult] = useState({});
  handler = handler || app;

  useEffect(() => {
    handler.on(event, setResult);
    return () => {
      handler.off(event, setResult);
    };
  }, [event, handler]);

  return result;
};

export default useEventListner;
