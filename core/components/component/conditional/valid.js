/* eslint-disable no-continue */
import React, { useEffect, useState } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const ConditionalValid = ({ view, model, path }) => {
  const [valid, setValid] = useState(false);

  useEffect(() => {
    let timer;

    const onChange = () => {
      clearTimeout(timer);

      timer = setTimeout(async () => {
        const { errors = [] } = await view.event("validate", { silent: true });

        setValid(!errors.length);
      }, 100);
    };

    view.on("change", onChange);
    return () => {
      view.off("change", onChange);
    };
  }, [view]);

  if (valid)
    return (
      <Wrapper className={model.className}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );
  return null;
};

export default ConditionalValid;
