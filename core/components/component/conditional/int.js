import { useCallback } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";

const byType = {
  "<": (v1, v2) => v1 < v2,
  ">": (v1, v2) => v1 > v2,
  "<=": (v1, v2) => v1 <= v2,
  ">=": (v1, v2) => v1 >= v2,
};

const ConditionalInt = ({ view, model, path }) => {
  const testCondition = useCallback(() => {
    const { condition } = model;
    for (let i = 0; i < condition.length; i++) {
      const [field, test] = condition[i];
      const val = view.getValue(field) || 0;

      // eslint-disable-next-line prefer-const
      let [, type, testVal] = test.match(/([<>=]{1,2})(.+)/im) || [];
      if (testVal === "now") testVal = Date.now();
      if (byType[type](parseFloat(val), parseFloat(testVal))) return true;
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

export default ConditionalInt;
