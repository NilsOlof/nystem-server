import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const InputWrapper = ({
  model,
  error,
  className: pClassName,
  children,
  id,
}) => {
  const inputWidth = model.classNameInput;

  function label() {
    const classNameLabel = [...(model.classNameLabel || [])];
    if (!model.floatlabel)
      classNameLabel.push(
        "mr-3 font-semibold sm:w-32 min-w-32 text-right align-top mt-1"
      );

    if (!model.text) return null;
    const text =
      typeof model.text === "string" ? app().t(model.text) : model.text;

    return (
      <Wrapper renderAs="label" htmlFor={id} className={classNameLabel}>
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

  const className = pClassName || model.className || [];

  if (model.nolabel)
    return (
      <Wrapper className={className}>
        {children}
        {info()}
        {errorMsg()}
      </Wrapper>
    );

  if (model.floatlabel)
    return (
      <Wrapper className={className}>
        {label()}
        <Wrapper renderAs="div">
          {children}
          {info()}
          {errorMsg()}
        </Wrapper>
      </Wrapper>
    );

  return (
    <Wrapper className={[...className, "sm:flex my-2"]}>
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
