import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const SelectView = ({ model, value }) => {
  const { className, renderAs, option } = model;
  let val = value || model.fallback;

  val =
    option
      .map((item) =>
        typeof item === "string" ? { _id: item, text: item } : item
      )
      .find(({ _id }) => value === _id) || {};

  return (
    <Wrapper renderAs={renderAs} className={className}>
      {app().t(val.text)}
    </Wrapper>
  );
};
export default SelectView;
