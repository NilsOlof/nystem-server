import { useState, useRef, useEffect } from "react";
import { ContentTypeRender, UseLocation, Wrapper } from "nystem-components";

const exclude = ["style"].map((item) => item.toUpperCase());

const RouterPageNotFound = ({ model, path, children, ...rest }) => {
  const location = UseLocation();
  const { className, renderAs, item, limit } = model || rest;
  const [is404, setIs404] = useState(false);
  const ref = useRef();

  useEffect(() => {
    setIs404(false);
    setTimeout(() => {
      const items = [...ref.current.parentElement.children]
        .map((item) => item.nodeName)
        .filter((name) => !exclude.includes(name));

      if (items.length < (limit || 2)) setIs404(true);
    }, 700);
  }, [limit, location.pathname, ref, setIs404]);

  if (!is404) return <div ref={ref} />;

  return (
    <Wrapper ref={ref} className={className} renderAs={renderAs}>
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default RouterPageNotFound;
