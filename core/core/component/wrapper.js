import React from "react";

const tags = [
  "p",
  "a",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "div",
  "nav",
  "section",
  "span",
  "b",
  "em",
  "strong",
  "i",
  "form",
  "button",
  "label",
  "table",
  "tbody",
  "thead",
  "tr",
  "th",
  "td",
  "sup",
].reduce((prev, tag) => {
  prev[tag] = true;
  return prev;
}, {});

const typeClass = {
  h1: "text-2xl",
  h2: "text-xl",
  h3: "text-4xl pb-5 pt-2",
  h4: "text-xl",
};

const Wrapper = (
  {
    renderAs,
    className,
    model,
    accessibilityLabel,
    accessible,
    translate,
    accessibilityTraits,
    children,
    onClick,
    style,
    ...props
  },
  ref
) => {
  model = model || {};
  className = className || model.className;

  className = className instanceof Array ? className : [className];

  if (!className.join("") && !renderAs && !onClick && !style)
    return children || null;

  if (!tags[renderAs] || renderAs === "input") renderAs = "div";
  className = className.join(" ");

  if (typeClass[renderAs])
    className = `${className || ""} ${typeClass[renderAs]}`;

  return React.createElement(
    renderAs,
    { ...props, ref, className, onClick, style },
    children
  );
};
export default React.forwardRef(Wrapper);
