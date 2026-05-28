import { TextView } from "nystem-components";

const IntView = ({ value, ...props }) => (
  <TextView {...props} value={value === 0 ? "0" : value} />
);
export default IntView;
