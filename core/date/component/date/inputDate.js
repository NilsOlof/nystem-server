import React, { useEffect, useState } from "react";
import { Icon, Wrapper } from "nystem-components";
import moment from "my-moment";

const dateFormat = "YYYY-MM-DD";

const DateInputDate = ({ model, focus, setValue, value }) => {
  const [inputVal, setInputVal] = useState(
    value ? moment(value).format(dateFormat) : "",
  );
  const { disabled, length } = model;

  useEffect(() => {
    setInputVal(value ? moment(value).format(dateFormat) : "");
  }, [value]);

  return (
    <Wrapper className="flex">
      <input
        className={"inset-3d w-49"}
        value={inputVal}
        maxLength={length}
        onChange={({ target }) => {
          setInputVal(target.value);
        }}
        disabled={disabled}
        type="text"
        onBlur={({ target }) => {
          let { value: val } = target;
          val = val.replace(/[^0-9]/gim, "");

          if (val.length === 0) {
            setValue(undefined);
            return;
          }
          if (val.length === 4) val = new Date().getFullYear() + val;
          if (val.length === 6) {
            let century = new Date().getFullYear().toString().substring(0, 2);
            if (val.substring(0, 2) > 50) century--;
            val = century + val;
          }

          val = `${val.substring(0, 4)}-${val.substring(4, 6)}-${val.substring(
            6,
            8,
          )}`;

          const time = value && moment(value).format("HH:mm");
          if (time) val += ` ${time}`;

          setValue(val ? moment(val).valueOf() : undefined);
        }}
        onFocus={({ target }) => {
          target.select();
        }}
        placeholder="((YY)YY)MMDD"
      />
      <Wrapper className="relative ml-1 mt-1 flex h-8 w-11 items-center justify-center rounded-md border border-black bg-black text-white shadow">
        <Icon icon="calendar" className="pointer-events-none h-5 w-5" />
        <input
          aria-label="Choose date"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          value={inputVal}
          maxLength={length}
          onChange={({ target }) => {
            setInputVal(target.value);
            setValue(target.value ? moment(target.value).valueOf() : undefined);
          }}
          disabled={disabled}
          type="date"
        />
      </Wrapper>
    </Wrapper>
  );
};
export default DateInputDate;
