import React from "react";
import { Wrapper } from "nystem-components";

const types = {
  primary: "bg-blue-500 hover:bg-blue-500 text-white rounded shadow-sm",
  secondary:
    "bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300 rounded shadow-sm",
  "ehc-primary": "floatlabel bg-primary text-white w-full",
  "ehc-secondary": "floatlabel bg-secondary border border-gray-300 w-full",
  danger: "bg-red-700 hover:bg-red-600 text-white rounded shadow-sm",
  warning: "bg-yellow-600 hover:bg-yellow-500 text-white rounded shadow-sm",
  success: "bg-green-600 hover:bg-green-500 text-white rounded shadow-sm",
  info: "btn",
  error: "btn",
  default: "bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300",
  primaryDisabled: "bg-blue-400 cursor-not-allowed",
  secondaryDisabled: "bg-gray-600 text-white cursor-not-allowed",
  dangerDisabled: "bg-red-400 text-white cursor-not-allowed",
  warningDisabled: "bg-yellow-300 text-white cursor-not-allowed",
  infoDisabled: "btn",
  errorDisabled: "btn",
  defaultDisabled: "bg-gray-300 text-white cursor-not-allowed",
};

const sizes = {
  xs: "py-1 px-2 text-xs",
  sm: "py-1 px-2 text-sm",
  base: "py-2 px-4 text-base",
  lg: "py-4 px-6 text-lg",
  xl: "py-4 px-8 text-xl",
  "2xl": "py-4 px-8 text-xl2",
};

const Button = ({
  onClick,
  className = [],
  type,
  size,
  disabled,
  ...props
}) => {
  className = className instanceof Array ? [...className] : [className];

  if (!className.includes("floatlabel")) {
    className.push(types[(type || "default") + (disabled ? "Disabled" : "")]);
    className.push(sizes[size] || sizes.base);
  }

  if (props.Component)
    return React.createElement(props.Component, {
      className,
      ...props,
    });

  return (
    <Wrapper
      renderAs="button"
      className={className}
      {...props}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
    />
  );
};
export default Button;
