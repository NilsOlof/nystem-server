import { Link, ContentTypeRender } from "nystem-components";

const ViewLinkFields = ({ model, value, path }) => {
  const { className, contentType, view: toView, add, addId, item } = model;

  let href = `/${contentType}/${toView}`;
  if (addId && value) href += `/${value._id}`;

  return (
    <Link to={(add || "") + href} className={className}>
      <ContentTypeRender path={path} items={item} />
    </Link>
  );
};

export default ViewLinkFields;
