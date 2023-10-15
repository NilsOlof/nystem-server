import { ContentTypeRender, UseLocation, Wrapper } from "nystem-components";

const checkMatch = {
  start: (path, match) => path.startsWith(match.substring(0, match.length - 1)),
  end: (path, match) => path.endsWith(match.substring(1)),
  includes: (path, match) =>
    path.includes(match.substring(1, match.length - 1)),
  exact: (path, match) => path === match,
};

const matchType = (path, match) => {
  if (!match || match === "*") return "exact";

  if (!(match instanceof Array)) match = [match];

  let checkType;
  return (
    match.find((match) => {
      checkType = match.endsWith("*") ? "start" : "exact";

      if (match.startsWith("*"))
        checkType = checkType === "start" ? "includes" : "end";

      return checkMatch[checkType](path, match);
    }) && checkType
  );
};

const useSearch = ({ useSearch }) => {
  const { pathname, search } = UseLocation();
  return useSearch ? search : pathname;
};

const RouterMatch = ({ model, path }) => {
  let pathname = useSearch(model);
  const { className, exclude, match, item } = model;

  if (pathname[2] === ":") pathname = pathname.substring(3);

  if (exclude === pathname) return null;

  const checkType = matchType(pathname, match);
  if ((!checkType && !model.invert) || (checkType && model.invert)) return null;

  return (
    <Wrapper className={className}>
      <ContentTypeRender path={path} items={item} />
    </Wrapper>
  );
};
export default RouterMatch;
