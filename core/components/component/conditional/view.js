/* eslint-disable no-continue */
import React, { useCallback } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const isset = (val) => !!val && !(val instanceof Array && val.length === 0);

const ConditionalView = ({ view, model, value, path }) => {
  const testCondition = useCallback(() => {
    const { condition } = model;
    for (let i = 0; i < condition.length; i++) {
      const val = view.getValue(condition[i][0]);
      let test = condition[i][1];
      if (test === "false") {
        if (!isset(val)) return true;
        continue;
      }
      if (test === "true") {
        if (isset(val)) return true;
        continue;
      }
      const reverse = test[0] === "!";
      if (reverse) test = test.substring(1);
      test = new RegExp(`^${test}$`, "i");
      if (test.test(val)) {
        if (!reverse) return true;
      } else if (reverse) return true;
    }
    return false;
  }, [model, view]);

  if (testCondition())
    return (
      <Wrapper className={model.className}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );
  return null;
};

export default ConditionalView;
