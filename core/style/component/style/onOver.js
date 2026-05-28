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

const StyleOnOver = ({ model, path, children }) => {
  const { className, item, classNameOut, classNameOver } = model;
  const over = useDelayed(model.delay);

  return (
    <Wrapper className={[className, over ? classNameOver : classNameOut]}>
      {children || <ContentTypeRender path={path} items={item} />}
    </Wrapper>
  );
};
export default StyleOnOver;
