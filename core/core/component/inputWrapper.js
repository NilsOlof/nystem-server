import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const InputWrapper = ({ model, error, className: pClassName, children }) => {
  const inputWidth = model.classNameInput;

  function label() {
    const labelWidth = model.classNameLabel || [];

    if (!model.text) return null;
    const text =
      typeof model.text === "string" ? app().t(model.text) : model.text;

    return (
      <Wrapper
        renderAs="label"
        htmlFor="id_input"
        className={[
          ...labelWidth,
          "mr-3 font-semibold sm:w-40 w-1/4 text-right align-top mt-2"
        ]}
      >
        {text}
        {model.mandatory && <span className="text-red-800 text-sm">*</span>}
      </Wrapper>
    );
  }

  function errorMsg() {
    error = error === true ? "Required field" : error;

    const className = ["text-red-600 ml-3"];
    if (pClassName) className.push(pClassName);

    if (error) return <p className={className.join(" ")}>{app().t(error)}</p>;
    return null;
  }

  const info = () =>
    model.info ? (
      <span className="help-block">{app().t(model.info)}</span>
    ) : null;

  const className = pClassName || [];

  if (model.nolabel)
    return (
      <Wrapper className={className}>
        {children}
        {info()}
        {errorMsg()}
      </Wrapper>
    );

  return (
    <Wrapper className={[...className, "flex my-4"]}>
      {label()}
      <Wrapper renderAs="div" className={inputWidth || "flex-grow"}>
        {children}
        {info()}
        {errorMsg()}
      </Wrapper>
    </Wrapper>
  );
};
export default InputWrapper;
