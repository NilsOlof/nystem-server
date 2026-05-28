import { Wrapper, ContentTypeRender, useUser } from "nystem-components";

const SessionConditional = ({ model, path }) => {
  const { className, field, item } = model;
  let { test } = model;
  const user = useUser();
  let val = user[field];
  if (val instanceof Array) val = val.join("|");

  const reverse = test[0] === "!";
  if (reverse) test = test.substring(1);
  test = new RegExp(!model.exact ? test : `^${test}$`, "i");
  if (test.test(val)) {
    if (reverse) return null;
  } else if (!reverse) return null;

  return (
    <Wrapper className={className}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default SessionConditional;
