"use strict";

const typeByFormat = {
  "YYYY-MM-DD": new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }),
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
  YYYY: new Intl.DateTimeFormat("sv-SE", { year: "numeric" }),
  ddd: new Intl.DateTimeFormat("en-US", { month: "short" }),
  MMM: new Intl.DateTimeFormat("en-US", { weekday: "short" }),
  YY: new Intl.DateTimeFormat("sv-SE", { year: "2-digit" }),
  MM: new Intl.DateTimeFormat("sv-SE", { month: "2-digit" }),
  DD: new Intl.DateTimeFormat("sv-SE", { day: "2-digit" }),
  M: new Intl.DateTimeFormat("sv-SE", { month: "numeric" }),
  D: new Intl.DateTimeFormat("sv-SE", { day: "numeric" }),
  HH: new Intl.DateTimeFormat("sv-SE", { hour: "2-digit" }),
  ss: new Intl.DateTimeFormat("sv-SE", { second: "2-digit" }),
  mm: {
    format: (at) => {
      const val = new Intl.DateTimeFormat("sv-SE", {
        minute: "2-digit",
      }).format(at);

      return val < 10 ? `0${val}` : val;
    },
  },
  H: new Intl.DateTimeFormat("sv-SE", { hour: "numeric" }),
  m: new Intl.DateTimeFormat("sv-SE", { minute: "numeric" }),
  dddd: new Intl.DateTimeFormat("en-GB", { weekday: "long" }),
};

const finderRegExp = new RegExp(Object.keys(typeByFormat).join("|"), "gi");
const replacer = (at) => (format) => typeByFormat[format]?.format(at);

const myMoment = (val) => {
  const at = new Date(val || Date.now());

  return {
    startOf: (isUTC) =>
      myMoment(
        (isUTC ? Date.UTC : Date)(at.getFullYear(), at.getMonth(), at.getDate())
      ),
    valueOf: () => at.getTime(),
    format: (format) => {
      if (!typeByFormat[format])
        return format.replace(finderRegExp, replacer(at));

      return typeByFormat[format].format(at);
    },
  };
};

module.exports = myMoment;

/*
    full: "ddd, D MMM YYYY HH:mm:ss +0000",
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

{
  weekday: 'narrow' | 'short' | 'long',
  era: 'narrow' | 'short' | 'long',
  year: 'numeric' | '2-digit',
  month: 'numeric' | '2-digit' | 'narrow' | 'short' | 'long',
  day: 'numeric' | '2-digit',
  hour: 'numeric' | '2-digit',
  minute: 'numeric' | '2-digit',
  second: 'numeric' | '2-digit',
  timeZoneName: 'short' | 'long',

  // Time zone to express it in
  timeZone: 'Asia/Shanghai',
  // Force 12-hour or 24-hour
  hour12: true | false,

  // Rarely-used options
  hourCycle: 'h11' | 'h12' | 'h23' | 'h24',
  formatMatcher: 'basic' | 'best fit'
}
*/
