import React, { useEffect, useRef, useState } from "react";
import "./index.css";

const byType = {
  text:
    "appearance-none block bg-black text-grey-darker border border-gray-800 rounded py-1 px-3 outline-none",
  password:
    "appearance-none block bg-black text-grey-darker border border-gray-800 rounded py-1 px-3 outline-none",
  checkbox: "m-4",
};

const Input = ({ type, value, ...props }, parentRef) => {
  const localRef = useRef(null);
  const [val, setVal] = useState(value);
  const ref = parentRef || localRef;

  const valRef = useRef();
  valRef.current = val;
  useEffect(() => {
    if (valRef.current === value) return;
    setVal(value);
  }, [value]);

  useEffect(() => {
    if (props.focus) ref.current.focus();
  }, [props.focus, ref]);

  let { className } = props;
  className =
    className instanceof Array
      ? className.flat(Infinity).filter((item) => item).join(" ")
      : className;

  type = type || "text";
  if (!className && ["text", "password"].includes(type))
    className = "sm:w-1/2 w-full";

  const elementProps = {
    ...props,
    ref,
    onChange: (e) => {
      setVal(e.target.value);
      props.onChange(e.target.value);
    },
    onFocus: (ev) => {
      if (props.selectAllOnFocus) ref.current.select();
      if (props.onFocus) return props.onFocus(ev);
    },
    className: `${byType[type]} ${className}`,
    type,
    value: val,
    focus: undefined,
    renderAs: undefined,
    accessibilityLabel: undefined,
    accessible: undefined,
    translate: undefined,
    accessibilityTraits: undefined,
  };

  Object.keys(elementProps)
    .filter((key) => elementProps[key] === undefined)
    .forEach((key) => {
      delete elementProps[key];
    });

  return type === "textarea" ? (
    <textarea {...elementProps} />
  ) : (
    <input {...elementProps} />
  );
};

export default React.forwardRef(Input);
