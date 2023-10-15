/* eslint-disable no-continue */
import { useCallback } from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const isset = (val) => !!val && !(val instanceof Array && val.length === 0);

const ConditionalView = ({ view, model, path }) => {
  const testCondition = useCallback(() => {
    const insertVal = (p1) => {
      if (p1 === "id") return view.id;

      if (p1.startsWith("params."))
        return view.params[p1.replace("params.", "")];

      if (p1.startsWith("app.settings."))
        return app().settings[p1.replace("app.settings.", "")];

      if (!p1.startsWith("baseView."))
        return view.getValue(p1.replace("..", path));

      p1 = p1.replace("baseView.", "");
      return view.baseView.getValue(p1.replace("..", path));
    };

    const { condition } = model;

    for (let i = 0; i < condition.length; i++) {
      const id = condition[i][0].replace(/^\./i, `${path}.`);
      const val = insertVal(id);

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

  const result = testCondition();
  if (!result && !model.itemNot?.length) return null;

  return (
    <Wrapper className={model.className}>
      <ContentTypeRender
        path={path}
        items={result ? model.item : model.itemNot}
      />
    </Wrapper>
  );
};

export default ConditionalView;
