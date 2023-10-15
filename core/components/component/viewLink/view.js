import app from "nystem";
import { Link, Button } from "nystem-components";

const ViewLinkView = ({ model, value }) => {
  const {
    renderType,
    className,
    contentType,
    view: toView,
    text,
    add,
    addId,
    btnType,
    size,
  } = model;

  let href = `/${contentType}/${toView}`;
  if (addId && value) href += `/${value._id}`;

  if (renderType === "button")
    return (
      <Button
        type={btnType}
        size={size}
        to={(add || "") + href}
        className={className}
        Component={Link}
      >
        {app().t(text)}
      </Button>
    );

  return (
    <Link
      type={renderType || "list"}
      to={(add || "") + href}
      className={className}
    >
      {app().t(text)}
    </Link>
  );
};

export default ViewLinkView;
