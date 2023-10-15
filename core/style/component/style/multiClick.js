import { useEffect, useState } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const StyleMultiClick = ({ model = {}, path, children }) => {
  const [active, setActive] = useState(false);
  const { className, renderAs, item, limit = 3 } = model;

  useEffect(() => {
    const onClick = (evt) => {
      if (evt.detail === limit) setActive(!active);
    };
    window.addEventListener("click", onClick);
    return () => {
      window.removeEventListener("click", onClick);
    };
  }, [active, limit]);

  if (!active) return null;
  return (
    <Wrapper className={className} renderAs={renderAs}>
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};

export default StyleMultiClick;
