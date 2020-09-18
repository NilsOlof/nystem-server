import { useState, useEffect } from "react";
import app from "nystem";

const UseEvent = (event, data) => {
  const [result, setResult] = useState({});

  useEffect(() => {
    app()
      .event(event, data)
      .then((result) => setResult(result));
  }, [data, event]);

  return result;
};

export default UseEvent;
