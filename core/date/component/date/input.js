import {
  InputWrapper,
  DateInputDate,
  UseValidator,
  Wrapper,
  DateInputTime,
  Icon,
} from "nystem-components";
import validate from "./validate";

const DateInput = ({ model, view, setValue, value }) => {
  const { dateType = ["date", "time"] } = model;
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const validateAndSet = (value) => {
    setValue(value);
    setValidated(true);
  };

  return (
    <InputWrapper model={model} error={error}>
      <Wrapper className="flex">
        {dateType.includes("date") && (
          <DateInputDate
            model={model}
            value={value}
            setValue={validateAndSet}
          />
        )}
        {dateType.includes("time") && (
          <DateInputTime
            model={model}
            value={value}
            setValue={validateAndSet}
          />
        )}
        {value ? (
          <Icon
            icon="xmark"
            className="mt-1 h-8 w-8 rounded-md bg-red-600 text-white shadow-xl hover:bg-red-700 p-1 mx-1"
            onClick={() => setValue(undefined)}
          />
        ) : (
          <Wrapper className="mx-1 h-8 w-8 " />
        )}
      </Wrapper>
    </InputWrapper>
  );
};
export default DateInput;
