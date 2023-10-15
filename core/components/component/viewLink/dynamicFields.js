import { Link, ContentTypeRender } from "nystem-components";

const ViewLinkDynamicFields = ({ view, path, model }) => {
  const insertVal = (val) => {
    if (!val) return val;
    return val.replace(/\{([a-z_.0-9]+)\}/gim, (str, p1) => {
      if (p1 === "id") return view.id;

      if (p1.indexOf("params.") === 0)
        return view.params[p1.replace("params.", "")];

      if (p1.indexOf("baseView.") !== 0)
        return view.getValue(p1.replace("..", path));

      p1 = p1.replace("baseView.", "");
      return view.baseView.getValue(p1.replace("..", path));
    });
  };

  const { className, exact, match, item, href } = model;

  const url = insertVal(href);
  if (url && url.startsWith("http"))
    return (
      <a href={url} rel="noopener noreferrer" target="_blank">
        <ContentTypeRender path={path} items={item} />
      </a>
    );

  return (
    <Link className={className} to={url} match={insertVal(match)} exact={exact}>
      <ContentTypeRender path={path} items={item} />
    </Link>
  );
};
export default ViewLinkDynamicFields;
