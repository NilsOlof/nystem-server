import { Input, InputWrapper, UseValidator } from "nystem-components";
import validate from "./validate";

const MultilinetextInput = ({ model, value, setValue, view }) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  value = value instanceof Array ? value : value ? [value] : [];

  value = value.filter((value) => value !== "");
  value.push("");

  const onChange = (itemValue, index) => {
    value[index] = itemValue;
    setValidated(true);
    setValue(value);
  };

  return (
    <InputWrapper model={model} error={error}>
      {value.map((value, index) => (
        <div key={index}>
          <Input
            className="textInputDefault"
            value={value}
            onChange={(value) => onChange(value, index)}
          />
        </div>
      ))}
    </InputWrapper>
  );
};

export default MultilinetextInput;
