import React, { useEffect, useRef } from "react";

const byType = {
  text:
    "appearance-none block bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-1 px-3",
  password:
    "appearance-none block bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-1 px-3",
  checkbox: "m-4",
};

const Input = ({ selectAllOnFocus, type, value, ...props }, parentRef) => {
  const localRef = useRef(null);
  const ref = parentRef || localRef;

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

  if (className && className.includes("floatlabel"))
    return (
      <input
        ref={ref}
        {...elementProps}
        className={` ${className}`}
        onChange={(e) => props.onChange(e.target.value)}
        onFocus={(ev) => {
          if (selectAllOnFocus) ref.current.select();
          if (elementProps.onFocus) return elementProps.onFocus(ev);
        }}
        type={type}
        value={value}
      />
    );

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
export default React.forwardRef(Input);
