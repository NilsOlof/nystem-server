import React from "react";

const Select = ({ className, ...props }) => (
  <select
    className={`${className} sm:w-1/2 w-full p-2 border bg-black border-black`}
    {...props}
  />
);
export default Select;
