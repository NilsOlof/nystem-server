"use strict";

const myMoment = (val) => {
  const at = new Date(val || Date.now());

  return {
    startOf: () =>
      myMoment(Date.UTC(at.getFullYear(), at.getMonth(), at.getDate())),
    valueOf: () => at.getTime(),
    format: (format) => {
      if (!typeByFormat[format]) console.error("Missing format", format);

      return typeByFormat[format].format(at);
    },
  };
};

const typeByFormat = {
  "YYYY-MM-DD": new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }),
  YYYY: new Intl.DateTimeFormat("sv-SE", { year: "numeric" }),
  YY: new Intl.DateTimeFormat("sv-SE", { year: "2-digit" }),
  M: new Intl.DateTimeFormat("sv-SE", { month: "numeric" }),
  D: new Intl.DateTimeFormat("sv-SE", { day: "numeric" }),
  MM: new Intl.DateTimeFormat("sv-SE", { month: "2-digit" }),
  DD: new Intl.DateTimeFormat("sv-SE", { day: "2-digit" }),
  "YYYY-MM-DD HH:mm": new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }),
  "HH:mm": new Intl.DateTimeFormat("sv-SE", {
    hour: "numeric",
    minute: "numeric",
  }),
  "H:mm": new Intl.DateTimeFormat("sv-SE", {
    hour: "numeric",
    minute: "numeric",
  }),
};

module.exports = myMoment;

/*

Input	Example	Description
YYYY	2014	4 or 2 digit year. Note: Only 4 digit can be parsed on strict mode
YY	14	2 digit year
Y	-25	Year with any number of digits and sign
Q	1..4	Quarter of year. Sets month to first month in quarter.
M MM	1..12	Month number
MMM MMMM	Jan..December	Month name in locale set by moment.locale()
D DD	1..31	Day of month
Do	1st..31st	Day of month with ordinal
DDD DDDD	1..365	Day of year
X	1410715640.579	Unix timestamp
x	1410715640579	Unix ms timestamp

https://devhints.io/wip/intl-datetime
https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/02-fromnow/

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
*/
