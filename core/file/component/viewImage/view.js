import React from "react";
import { Image } from "nystem-components";

const ViewImageView = ({ model }) => {
  const className = model.className ? model.className.join(" ") : "";

  return (
    <Image alt="logo" className={className} src={`/image/${model.filename}`} />
  );
};
export default ViewImageView;
