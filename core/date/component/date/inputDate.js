import React, { useEffect, useRef, useState } from "react";
import { Icon, Wrapper } from "nystem-components";
import moment from "my-moment";
import "./inputDate.css";

const ClearButton = ({ setValue }) => (
  <Icon
    onClick={() => setValue("")}
    className="absolute right-0 top-0 m-3 w-4"
    icon="xmark"
    aria-hidden="true"
  />
);

const dateFormat = "YYYY-MM-DD";

const DateInputDate = ({ model, focus, setValue, value }) => {
  const [inputVal, setInputVal] = useState(
    value ? moment(value).format(dateFormat) : ""
  );
  const { disabled, length } = model;

  const inputEl = useRef(null);

  useEffect(() => {
    setInputVal(value ? moment(value).format(dateFormat) : "");
  }, [value]);

  return (
    <input
      ref={inputEl}
      className={"inset-3d"}
      value={inputVal}
      maxLength={length}
      onChange={(e) => {
        setInputVal(e.target.value);
        setValue(inputVal ? moment(inputVal).valueOf() : undefined);
      }}
      disabled={disabled}
      data-date={inputVal}
      type="date"
      onBlur={() => setValue(inputVal ? moment(inputVal).valueOf() : undefined)}
    />
  );
};
export default DateInputDate;
