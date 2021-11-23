/* eslint-disable no-continue */
import React, { useCallback } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const isset = (val) => !!val && !(val instanceof Array && val.length === 0);

const ConditionalView = ({ view, model, path }) => {
  const testCondition = useCallback(() => {
    const { condition } = model;
    for (let i = 0; i < condition.length; i++) {
      const id = condition[i][0].replace(/^\./i, `${path}.`);
      const val = view.getValue(id);

      let test = condition[i][1];

      if (test === "false") {
        if (!isset(val)) return true;
        continue;
      }

      if (test === "undefined") {
        if (val === undefined) return true;
        continue;
      }

      if (test === "true") {
        if (isset(val)) return true;
        continue;
      }

      const reverse = test[0] === "!";
      if (reverse) test = test.substring(1);
      test = new RegExp(model.notExact ? test : `^${test}$`, "i");

      if (test.test(val)) {
        if (!reverse) return true;
      } else if (reverse) return true;
    }
    return false;
  }, [model, path, view]);

  if (testCondition())
    return (
      <Wrapper className={model.className}>
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );
  return null;
};

export default ConditionalView;
