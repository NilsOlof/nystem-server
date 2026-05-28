import { Vibration } from "react-native";
import { useCallback, useEffect } from "react";

const BooleanVibrate = (props) => {
  const vibrate = useCallback((currentProps) => {
    const { atState, pattern } = currentProps.model;
    if (currentProps.value === atState)
      Vibration.vibrate(pattern ? JSON.parse(pattern) : 300, false);
  }, []);

  useEffect(() => {
    vibrate(props);
  }, [props.model, props.value, vibrate]);

  return null;
};
export default BooleanVibrate;
