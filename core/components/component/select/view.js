import app from "nystem";
import { Wrapper } from "nystem-components";

const SelectView = ({ model, value }) => {
  const { renderAs, className, option = [], itemClassName } = model;
  value = value instanceof Array ? value : [value || model.fallback];

  const val =
    option
      .map((item) =>
        typeof item === "string" ? { _id: item, text: item } : item
      )
      .filter(({ _id }) => value.includes(_id)) || [];

  const optionItem = (item, index) => (
    <Wrapper key={index} className={itemClassName}>
      {app().t(item.text)}
    </Wrapper>
  );

  return (
    <Wrapper renderAs={renderAs} className={className}>
      {val.map(optionItem)}
    </Wrapper>
  );
};
export default SelectView;
