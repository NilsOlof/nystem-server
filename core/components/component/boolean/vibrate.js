import { useCallback, useEffect } from "react";

const BooleanVibrate = (props) => {
  const vibrate = useCallback((currentProps) => {
    if (!navigator.vibrate) return;
    const { atState, pattern } = currentProps.model;
    if (currentProps.value === atState)
      navigator.vibrate(pattern ? JSON.parse(pattern) : 300);
  }, []);

  useEffect(() => {
    vibrate(props);
  }, [props.model, props.value, vibrate]);

  return null;
};
export default BooleanVibrate;
