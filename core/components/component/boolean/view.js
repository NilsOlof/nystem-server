import { Icon } from "nystem-components";

const BooleanView = ({ model, value }) =>
  value ? <Icon className={model.className} icon="check" /> : null;

export default BooleanView;
