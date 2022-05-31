import React from "react";
import { Wrapper } from "nystem-components";

const divByType = [
  { name: "year", div: 60 * 24 * 365.4, sub: "y" },
  { name: "day", div: 60 * 24, sub: "d" },
  { name: "hour", div: 60, sub: "h" },
  { name: "minit", div: 1, sub: "m" },
];

const DateRel = ({ model, value }) => {
  const { className, renderAs, addSub, show, fallback = "" } = model;

  value = parseInt(value, 10);

  const delta = Date.now() - parseInt(value, 10);
  let minit = delta / 1000 / 60;

  const out =
    value &&
    divByType
      .map(({ name, div, sub }) => {
        const val = Math.trunc(minit / div);

        minit -= val * div;

        if (!show.includes(name)) return;
        if (addSub) return val + sub;

        return val;
      })
      .filter((val) => val !== undefined)
      .join(" ");

  return (
    <Wrapper renderAs={renderAs} className={className}>
      {out || fallback}
    </Wrapper>
  );
};

export default DateRel;
