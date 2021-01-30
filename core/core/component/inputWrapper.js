import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";
import "./inputWrapper.css";

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
        "mr-3 font-semibold sm:w-40 w-1/4 text-right align-top mt-2"
      );

    if (!model.text) return null;
    const text =
      typeof model.text === "string" ? app().t(model.text) : model.text;

    return (
      <Wrapper renderAs="label" htmlFor={id} className={classNameLabel}>
        {text}
        {model.mandatory && (
          <Wrapper renderAs="span" className="text-red-800 text-sm">
            *
          </Wrapper>
        )}
      </Wrapper>
    );
  }

  function errorMsg() {
    error = error === true ? "Required field" : error;

    const className = ["text-red-600 mr-3 sm:w-40 w-1/4 text-right align-top"];
    if (pClassName) className.push(pClassName);

    if (error)
      return (
        <Wrapper renderAs="p" className={className}>
          {app().t(error)}
        </Wrapper>
      );
    return null;
  }

  const info = () =>
    model.info ? (
      <span className="mr-3 sm:w-40 w-1/4 text-right align-top">
        {app().t(model.info)}
      </span>
    ) : null;

  const className = pClassName || model.className;

  if (model.noWrapper)
    return (
      <>
        <label htmlFor={id} className="label-hidden">
          {model.text}
        </label>
        {children}
      </>
    );

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
    <Wrapper className={[className, "my-4"]}>
      <Wrapper className={"sm:flex"}>
        {label()}
        <Wrapper renderAs="div" className={inputWidth || "flex-grow"}>
          {children}
        </Wrapper>
      </Wrapper>
      {info()}
      {errorMsg()}
    </Wrapper>
  );
};
export default InputWrapper;
