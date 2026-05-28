import { useContext, useEffect, useState } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

import { HideOnNotOverContext } from "./onOverHandle";

const useDelayed = (delay) => {
  const over = useContext(HideOnNotOverContext);
  const [delayedOver, setDelayedOver] = useState(false);

  useEffect(() => {
    if (!delay || over) return;
    setDelayedOver(true);

    const timer = setTimeout(() => {
      setDelayedOver(false);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [delay, over, setDelayedOver]);

  return delay && !over ? delayedOver : over;
};

const StyleOnOverRemove = ({ model, path, children }) => {
  const { className, item, invert } = model;
  let over = useDelayed(model.delay);

  if (invert) over = !over;
  if (over)
    return (
      <Wrapper className={className}>
        {children || <ContentTypeRender path={path} items={item} />}
      </Wrapper>
    );

  return null;
};
export default StyleOnOverRemove;
