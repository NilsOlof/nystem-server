import React from "react";
import { Wrapper, UseEventListner } from "nystem-components";

const ViewListInfiniteScrollPos = ({ model, view }) => {
  const { text, className, classNameLabel, classNameInfo } = model;
  const { pos, total } = UseEventListner(view, "infiniteScrollPos");

  if (!total) return null;

  return (
    <Wrapper className={className}>
      <Wrapper className={classNameLabel}>{text}</Wrapper>
      <Wrapper className={classNameInfo}>
        {pos + 1} of {total + 1}
      </Wrapper>
    </Wrapper>
  );
};
export default ViewListInfiniteScrollPos;
