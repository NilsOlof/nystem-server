import { useState } from "react";
import {
  InputWrapper,
  SelectInput,
  UseSearch,
  RouterUseQueryStore,
} from "nystem-components";

const modelYear = {
  id: "year",
  option: [1200],
  render: "button",
  limit: 1,
  text: "Year",
};

const months = Array.from({ length: 12 }, (e, i) =>
  new Date(null, i + 1, null).toLocaleDateString("en", {
    month: "short",
  })
);
const modelMonth = {
  id: "month",
  option: months,
  render: "button",
  limit: 1,
  text: "Month",
};

const modelDay = {
  id: "day",
  option: [],
  render: "button",
  limit: 1,
  text: "Day",
};

const daysInMonth = (year, month) => new Date(year, month, 0).getDate();
const getArray = (from, to) =>
  Array.from({ length: to - from }, (e, i) => parseInt(from, 10) + i);

const getDate = ({ utc, year, month = 0, day = 1 }) =>
  utc ? Date.UTC(year, month, day) : new Date(year, month, day).getTime();

const addUTC = {
  getFullYear: "getUTCFullYear",
  getMonth: "getUTCMonth",
  getDate: "getUTCDate",
};

const getByType = (utc, val, func) =>
  val ? new Date(val)[utc ? addUTC[func] : func]() : undefined;

const DateExposedYearMonth = ({ model, view }) => {
  const [years] = useState(
    getArray(model.from, model.to || new Date().getFullYear() + 1)
  );
  const [from, setFrom] = RouterUseQueryStore(model.saveIdFrom, "int");
  const [to, setTo] = RouterUseQueryStore(model.saveIdTo, "int");
  UseSearch({
    view,
    id: model.id,
    value: from && `>${from - 1}`,
    noListen: true,
  });
  UseSearch({ view, id: model.id, value: to && `<${to + 1}`, noListen: true });

  const { utc } = model;

  const year = getByType(utc, from, "getFullYear");

  const fromMonth = getByType(utc, from, "getMonth");
  const toMonth = getByType(utc, to, "getMonth");
  const month = fromMonth === toMonth ? months[fromMonth] : undefined;

  const fromDay = getByType(utc, from, "getDate");
  const toDay = getByType(utc, to, "getDate");
  const day = fromDay === toDay ? toDay : undefined;

  const setYear = (year) => {
    setFrom(year && getDate({ utc, year }));
    setTo(year && getDate({ utc, year: year + 1 }) - 1);
  };

  const setMonth = (value) => {
    if (!value) setYear(year);
    else {
      const month = months.indexOf(value);
      setFrom(getDate({ utc, year, month }));
      setTo(getDate({ utc, year, month: month + 1 }) - 1);
    }
  };

  const setDay = (day) => {
    const month = fromMonth;
    if (!day) setMonth(months[month]);
    else {
      setFrom(getDate({ utc, year, month, day }));
      setTo(getDate({ utc, year, month, day: day + 1 }) - 1);
    }
  };

  return (
    <InputWrapper model={model}>
      <SelectInput
        model={{
          ...modelYear,
          classNameInput: "yearExposedField",
          option: years,
        }}
        value={year}
        setValue={setYear}
      />
      {year && model.month && (
        <SelectInput model={modelMonth} value={month} setValue={setMonth} />
      )}
      {month && model.day && (
        <SelectInput
          model={{
            ...modelDay,
            option: getArray(1, daysInMonth(year, fromMonth) + 1),
            classNameInput: "dayExposedField",
          }}
          value={day}
          setValue={setDay}
        />
      )}
    </InputWrapper>
  );
};

export default DateExposedYearMonth;
