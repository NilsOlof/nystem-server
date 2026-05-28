import { useState, useEffect } from "react";
import "./loading.css";

const Loading = () => {
  const [state, setState] = useState({ inDelay: true });
  useEffect(() => {
    const delayTimer = setTimeout(() => setState({ inDelay: false }), 200);
    return () => clearTimeout(delayTimer);
  }, []);

  return state.inDelay ? null : (
    <div className="loading m-2 rounded-lg shadow h-2" />
  );
};

export default Loading;
