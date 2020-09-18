import React from "react";
import app from "nystem";
import { Wrapper } from "nystem-components";

const SelectView = ({ model, value }) => {
  const { className, renderAs, option } = model;
  let val = value || model.fallback;

  for (let i = 0; option && i < option.length; i++)
    if (option[i]._id === val) {
      val = option[i].text;
      break;
    }

  return (
    <Wrapper renderAs={renderAs} className={className}>
      {app().t(val)}
    </Wrapper>
  );
};
export default SelectView;
