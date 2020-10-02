/* eslint-disable jsx-a11y/mouse-events-have-key-events */
import React, { useState } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

export const HideOnNotOverContext = React.createContext();

const StyleOnOverHandle = ({ model, path }) => {
  const [over, setOver] = useState(false);
  const { item, className } = model;

  return (
    <Wrapper
      onMouseOver={() => setOver(true)}
      onMouseOut={() => setOver(false)}
      className={className}
    >
      <HideOnNotOverContext.Provider value={over}>
        {<ContentTypeRender path={path} items={item} />}
      </HideOnNotOverContext.Provider>
    </Wrapper>
  );
};
export default StyleOnOverHandle;
