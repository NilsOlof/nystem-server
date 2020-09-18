import React from "react";
import { Wrapper } from "nystem-components";
// eslint-disable-next-line import/extensions
import icons from "../../../icons";
// eslint-disable-next-line import/extensions
import iconsViewPorts from "../../../iconsViewPorts";

const rotate = (deg) =>
  (deg && { style: { transform: `rotate(${deg}deg)` } }) || undefined;

const Icon = ({ icon, className, renderAs, deg, ...props }) => {
  className = className instanceof Array ? className : [className];
  return (
    <Wrapper renderAs={renderAs} className={renderAs && className}>
      <svg
        className={[...className, "fill-current"].join(" ")}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={iconsViewPorts[icon] || "0 0 20 20"}
        {...rotate(deg)}
        {...props}
      >
        {icons[icon]}
      </svg>
    </Wrapper>
  );
};
export default Icon;
