import { Link, Wrapper } from "nystem-components";

const TextLink = ({ model, view, value }) => {
  const id = view.value ? `/${view.value._id}` : "";
  const format = model.toFormat || "input";

  if (model.renderAs)
    return (
      <Wrapper renderAs={model.renderAs} className={model.className}>
        <Link
          to={`${model.addToPath || ""}/${view.contentType}/${format}${id}`}
        >
          {value || model.fallback}
        </Link>
      </Wrapper>
    );

  return (
    <Link
      renderAs={model.renderAs}
      className={model.className}
      to={`${model.addToPath || ""}/${view.contentType}/${format}${id}`}
    >
      {value || model.fallback}
    </Link>
  );
};
export default TextLink;
