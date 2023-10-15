import { useState, useEffect } from "react";
import { Wrapper, Input } from "nystem-components";
import app from "nystem";
import moment from "my-moment";

const parseVal = (val) => {
  if (val > 100) val /= 100;

  const parts = val
    .toString()
    .split(/[^0-9]/)
    .filter((part) => part);

  const min = parseFloat(`.${parts[1] || 0}`) * 100;
  return `${parts[0]}:${min < 10 ? `0${min}` : min}`;
};

const DateInputTime = ({ model, focus, setValue, value }) => {
  const { disabled, length, inputClassName = [] } = model;
  const [inputVal, setInputVal] = useState("");

  useEffect(() => {
    setInputVal(value ? moment(value).format("HH:mm") : "");
  }, [value]);

  return (
    <Wrapper className="flex">
      <Input
        placeholder={app().t("Time")}
        className={["w-40", inputClassName]}
        value={inputVal}
        maxLength={length}
        onChange={(value) => setInputVal(value)}
        disabled={disabled}
        type="text"
        focus={focus}
        onBlur={() => {
          if (!inputVal) return;
          const datePart = moment(value || Date.now()).format("YYYY-MM-DD");
          setValue(moment(`${datePart} ${parseVal(inputVal)}`).valueOf());
        }}
      />
    </Wrapper>
  );
};
export default DateInputTime;
