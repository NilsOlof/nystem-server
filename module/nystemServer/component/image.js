import React from "react";
import app from "nystem";

const add = (path) => {
  if (/^https?:/im.test(path)) return path;

  const { domain, secure } = app().settings;
  return `http${secure ? "s" : ""}://${domain}${path}`;
};

const Image = ({ className, alt, src, ...props }) => (
  <img
    alt={alt}
    {...props}
    className={
      className instanceof Array
        ? className
            .flat(Infinity)
            .filter((item) => item)
            .join(" ")
        : className
    }
    src={add(src)}
  />
);

export default Image;
