import React from "react";
import { Image } from "nystem-components";

const ViewImageView = ({ model }) => (
  <Image
    alt="logo"
    className={model.className}
    width={model.width}
    height={model.height}
    src={model.fullPath ? model.filename : `/image/${model.filename}`}
  />
);
export default ViewImageView;
