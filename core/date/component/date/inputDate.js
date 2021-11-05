import React, { useEffect, useRef, useCallback, useState } from "react";
import { Icon, Wrapper } from "nystem-components";
import app from "nystem";
import moment from "my-moment";

const ClearButton = ({ setValue }) => (
  <Icon
    onClick={() => setValue("")}
    className="absolute w-4 right-0 top-0 m-3"
    icon="close"
    aria-hidden="true"
  />
);

const dateFormat = "YYYY-MM-DD";

const DateInputDate = ({ model, focus, setValue, value }) => {
  const [inputVal, setInputVal] = useState(
    value ? moment(value).format(dateFormat) : ""
  );
  const { disabled, length, text } = model;

  const inputEl = useRef(null);

  const setFromPicker = useCallback(
    function () {
      const formVal = this.getMoment().format(dateFormat);
      setValue(moment(formVal).valueOf());
    },
    [setValue]
  );

  useEffect(() => {
    setInputVal(value ? moment(value).format(dateFormat) : "");
  }, [value]);

  useEffect(() => {
    const start = async () => {
      const { pikaday } = await import("../../client/pikaday");
      pikaday({
        field: inputEl.current,
        format: dateFormat,
        onSelect: setFromPicker,
        firstDay: 1,
      });
    };
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Wrapper className="relative w-1/3">
      <input
        ref={inputEl}
        placeholder={app().t(text)}
        className={
          "appearance-none block bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-2 px-3 w-full"
        }
        value={inputVal}
        maxLength={length}
        onChange={(e) => setInputVal(e.target.value)}
        disabled={disabled}
        type="text"
        focus={focus}
        onBlur={() => setValue(moment(inputVal).valueOf())}
      />
      {value ? <ClearButton setValue={setValue} /> : null}
    </Wrapper>
  );
};
export default DateInputDate;
