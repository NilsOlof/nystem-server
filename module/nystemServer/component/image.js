import React from "react";
import app from "nystem";

const add = (path) => {
  const { domain, secure } = app().settings;
  return `http:${secure ? "s" : ""}//${domain}${path}`;
};

const Image = (props) => (
  <img alt={props.alt} {...props} src={add(props.src)} />
);

export default Image;
