import { TextView } from "nystem-components";

const SliderView = ({ value, ...props }) => {
  const { precision } = props.model;
  // eslint-disable-next-line eqeqeq
  value = precision == 0 ? parseInt(value, 10) : value.toFixed(precision);
  return <TextView value={value} {...props} />;
};
export default SliderView;
