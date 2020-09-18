import React from "react";
import {
  InputWrapper,
  DateInputDate,
  UseValidator,
  Wrapper,
  DateInputTime
} from "nystem-components";
import validate from "./validate";

const DateInput = ({ model, view, focus, setValue, value }) => {
  const { dateType = ["date", "time"] } = model;
  const [error, setValidated] = UseValidator({ view, validate, value, model });
  const validateAndSet = value => {
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
      </Wrapper>
    </InputWrapper>
  );
};
export default DateInput;
