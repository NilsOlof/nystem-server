import React, { useEffect, useRef } from "react";

const byType = {
  text:
    "appearance-none block bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-2 px-3",
  password:
    "appearance-none block bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-2 px-3",
  checkbox: "m-4",
};

const Input = ({ selectAllOnFocus, type, value, ...props }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (props.focus) ref.current.focus();
  }, [props.focus, ref]);

  const elementProps = { ...props };
  delete elementProps.focus;
  delete elementProps.renderAs;
  delete elementProps.accessibilityLabel;
  delete elementProps.accessible;
  delete elementProps.translate;
  delete elementProps.accessibilityTraits;
  delete elementProps.accessibilityTraits;

  let { className } = props;
  className = className instanceof Array ? className.join(" ") : className;

  type = type || "text";
  if (!className && ["text", "password"].includes(type))
    className = "sm:w-1/2 w-full";

  return (
    <input
      ref={ref}
      {...elementProps}
      className={`${byType[type]} ${className}`}
      onChange={(e) => props.onChange(e.target.value)}
      onFocus={(ev) => {
        if (selectAllOnFocus) ref.current.select();
        if (elementProps.onFocus) return elementProps.onFocus(ev);
      }}
      type={type}
      value={value}
    />
  );
};
export default Input;
