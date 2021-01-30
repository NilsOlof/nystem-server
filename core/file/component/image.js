import React from "react";

const Image = ({ alt, className, ...props }) => (
  <img
    alt={alt}
    className={
      className instanceof Array
        ? className
            .flat(Infinity)
            .filter((item) => item)
            .join(" ")
        : className
    }
    {...props}
  />
);

export default Image;
