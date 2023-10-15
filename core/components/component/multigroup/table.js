import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const getId = (item, model) =>
  item.id.replace(new RegExp(`^${model.id}.`, "i"), "");

const MultigroupTable = ({ value, view, model, path }) => {
  const {
    rowClassName,
    emptyFields,
    className,
    headerFields,
    item,
    footerFields,
    renderFormat,
  } = model;

  value = value || [];
  if (model.limit) value = value.slice(0, model.limit);

  const oneRow = ({ model, renderAs, renderItemAs, path, key }) => (
    <Wrapper key={key} renderAs={renderAs} className={rowClassName}>
      {model.map((item, index) => (
        <Wrapper renderAs={renderItemAs} key={index}>
          <ContentTypeRender path={path} items={[item]} />
        </Wrapper>
      ))}
    </Wrapper>
  );

  const onItem = (model, renderAs, renderItemAs) => (item, index) => {
    const items = app().replaceInModel({
      model,
      viewFormat: view.viewFormat,
      fn: ({ model: item }) =>
        item.id && item.id.indexOf(model.id) === 0
          ? { ...item, id: getId(item, model) }
          : item,
    }).item;

    const itemPath = `${view.getValuePath(path, model.id)}.${index}`;

    return oneRow({
      model: items,
      renderAs,
      renderItemAs,
      path: itemPath,
      key: index,
    });
  };

  if (value.length === 0 && emptyFields && emptyFields.length > 0)
    return (
      <Wrapper className={className}>
        <ContentTypeRender items={emptyFields} />
      </Wrapper>
    );

  if (model.renderFormat === "table")
    return (
      <Wrapper renderAs="table" className={className}>
        <Wrapper renderAs="thead">
          {oneRow({
            model: headerFields,
            renderAs: "tr",
            renderItemAs: "th",
            path,
          })}
        </Wrapper>
        <Wrapper renderAs="tbody">
          {value.map(onItem(model, "tr", "td"))}
          {oneRow({
            model: footerFields,
            renderAs: "tr",
            renderItemAs: "td",
            path,
          })}
        </Wrapper>
      </Wrapper>
    );

  if (renderFormat === "list")
    return (
      <Wrapper className={className}>
        {value.map(onItem(item, "ul", "li"))}
      </Wrapper>
    );

  if (headerFields && headerFields.length)
    return (
      <Wrapper className={className}>
        <ContentTypeRender items={headerFields} />
        {value.map(onItem(item))}
      </Wrapper>
    );

  return <Wrapper className={className}>{value.map(onItem())}</Wrapper>;
};
export default MultigroupTable;
