import React from "react";

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
    title,
    ...props
  },
  ref
) => {
  className =
    className instanceof Array
      ? className
          .flat(Infinity)
          .filter((item) => item)
          .join(" ")
      : className;

  if (
    !ref &&
    !className &&
    !renderAs &&
    !onClick &&
    !style &&
    !Object.keys(props).length
  )
    return children || null;

  if (!renderAs || renderAs === "input") renderAs = "div";

  return React.createElement(
    renderAs,
    { ...props, title, ref, className, onClick, style },
    children
  );
};
export default React.forwardRef(Wrapper);
