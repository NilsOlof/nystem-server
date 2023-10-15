import { Wrapper } from "nystem-components";

const Select = ({ className, ...props }) => (
  <Wrapper renderAs="select" className={className} {...props} />
);
export default Select;
