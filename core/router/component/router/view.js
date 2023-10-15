import { Wrapper, ContentTypeRender, UseLocation } from "nystem-components";

const RouterView = ({ model, view, path }) => {
  const { className, renderAs, item } = model;
  const { pathname } = UseLocation();

  const insertVal = (val) =>
    val &&
    val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
      if (/pathItem[0-9]/.test(p1) && view.params) return view.params[p1[8]];
      return view.getValue(p1.replace("..", path));
    });

  if (!pathname.match(new RegExp(insertVal(model.match)))) return null;

  return (
    <Wrapper className={className} renderAs={renderAs}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default RouterView;
