import { forwardRef, useState, useEffect } from "react";
import { Wrapper } from "nystem-components";
import icons from "../../../icons.json";

icons.question =
  "0 0 320 512|M204.3 32.01H96c-52.94 0-96 43.06-96 96c0 17.67 14.31 31.1 32 31.1s32-14.32 32-31.1c0-17.64 14.34-32 32-32h108.3C232.8 96.01 256 119.2 256 147.8c0 19.72-10.97 37.47-30.5 47.33L127.8 252.4C117.1 258.2 112 268.7 112 280v40c0 17.67 14.31 31.99 32 31.99s32-14.32 32-31.99V298.3L256 251.3c39.47-19.75 64-59.42 64-103.5C320 83.95 268.1 32.01 204.3 32.01zM144 400c-22.09 0-40 17.91-40 40s17.91 39.1 40 39.1s40-17.9 40-39.1S166.1 400 144 400z";

const rotate = (deg) =>
  (deg && { style: { transform: `rotate(${deg}deg)` } }) || undefined;

const Icon = ({ icon, className, renderAs, deg, ...props }, ref) => {
  const [data, setData] = useState(icons);

  useEffect(() => {
    if (data[icon]) return;

    fetch(`/geticon/${icon}.txt`)
      .then((response) => response.text())
      .then((text) => text && setData({ ...data, [icon]: text }));
  }, [icon, data]);

  if (!data[icon]) return null;

  if (data[icon] === "missing") {
    console.log(
      `💥 Icon missing ${icon} at https://fontawesome.com/search?m=free&q=${
        icon || ""
      }`
    );
    data[icon] = icons.question;
  }

  const [viewPort, path, pathProps] = data[icon].split("|");
  let add = {};

  if (pathProps) {
    const parts = pathProps?.split(":");
    add = { [parts[0]]: parts[1] };
  }

  return (
    <Wrapper renderAs={renderAs} className={renderAs && className}>
      <svg
        ref={ref}
        className={`${
          className instanceof Array
            ? className
                .flat(Infinity)
                .filter((item) => item)
                .join(" ")
            : className
        } fill-current`}
        xmlns="http://www.w3.org/2000/svg"
        viewBox={viewPort}
        {...rotate(deg)}
        {...props}
      >
        <title>{props.title || icon}</title>
        <path d={path} {...add} />
      </svg>
    </Wrapper>
  );
};
export default forwardRef(Icon);

// https://www.zondicons.com/icons.html
// https://fontawesome.com/icons
