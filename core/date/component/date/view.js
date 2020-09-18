import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
import app from "nystem";
import { Wrapper } from "nystem-components";

const dateTimeFormats = {
  dateLong: "YYYY-MM-DD",
  timeLong: "H:mm",
  dateTimeLong: "YYYY-MM-DD HH:mm",
  dateTimeNoYear: "D/M H:mm",
  dateTimeNoYearDay: "ddd D/M H:mm",
  dateNoYearDay: "ddd D/M",
  timeDay: "ddd D/M H:mm",
  day: "dddd",
};

const hourInMs = 1000 * 60 * 60;

const DateView = ({ model, value }) => {
  const { className, renderAs, dateFormat } = model;
  const format = dateTimeFormats[dateFormat || "dateTimeLong"];
  value = parseInt(value, 10);
  let rel = value && model.relative && value + hourInMs * 24 - Date.now();
  rel = !rel || rel < 0 ? 0 : rel;
  if (rel && moment().startOf("day").valueOf() > value) rel = 0;

  const formatDate = useCallback(
    () =>
      rel
        ? rel > 23 * hourInMs
          ? moment(value).fromNow()
          : moment(value).format("H:mm")
        : moment(value).format(format),
    [format, rel, value]
  );
  const [result, setResult] = useState(formatDate());

  useEffect(() => {
    if (!rel) return;

    const update = () => setResult(formatDate());
    const timer = setInterval(update, 30000);
    return () => {
      clearInterval(timer);
    };
  }, [formatDate, rel]);

  return (
    <Wrapper renderAs={renderAs} className={className}>
      {app().t(value ? result : "")}
    </Wrapper>
  );
};

export default DateView;
