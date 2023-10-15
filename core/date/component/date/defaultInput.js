import { InputWrapper, UseValidator, Icon, Wrapper } from "nystem-components";
import moment from "my-moment";
import validate from "./validate";

const dateFormat = "YYYY-MM-DD HH:mm:ss";

const DateDefaultInput = ({ model, setValue, value, view }) => {
  const { dateType = ["date", "time"] } = model;
  const [error, setValidated] = UseValidator({ view, validate, value, model });

  return (
    <InputWrapper model={model} error={error}>
      <Wrapper className="flex items-center">
        <input
          className={"inset-3d"}
          value={value ? moment(value).format(dateFormat) : ""}
          maxLength={length}
          onChange={(e) => {
            setValue(
              e.target.value ? moment(e.target.value).valueOf() : undefined
            );
            setValidated();
          }}
          type={dateType.includes("time") ? "datetime-local" : "date"}
        />
        {value ? (
          <Icon
            icon="xmark"
            className="mx-2 mt-1 h-6 w-6 rounded-md bg-red-600 p-1 text-white shadow-xl hover:bg-red-700"
            onClick={() => setValue(undefined)}
          />
        ) : (
          <Wrapper className="mx-2 h-6 w-6 " />
        )}
      </Wrapper>
    </InputWrapper>
  );
};
export default DateDefaultInput;
