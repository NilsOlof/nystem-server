import React from "react";
import { Wrapper } from "nystem-components";

const Tooltip = ({ text, children }) => (
  <Wrapper className={["group/tooltip", "relative", "inline-flex"]}>
    {children}
    <span role="tooltip" className="pointer-events-none absolute left-0 top-full z-50 mt-1 hidden whitespace-nowrap rounded border border-gray-600 bg-gray-950 px-2 py-1 text-xs font-normal text-gray-100 shadow-lg group-hover/tooltip:block group-focus-within/tooltip:block">
      {text}
    </span>
  </Wrapper>
);

export default Tooltip;
