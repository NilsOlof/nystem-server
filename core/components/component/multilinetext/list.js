const MultilinetextList = ({ value, model = {}, wrapper }) => {
  if (!value) return null;

  if (!Array.isArray(value)) value = [value];

  const createItem = (item, index) => {
    const add = value.length !== index + 1 ? ", " : "";
    return (
      <span key={index}>
        <a href={`http://${item}`} rel="noopener noreferrer" target="_blank">
          {item}
        </a>
        {add}
      </span>
    );
  };

  const className =
    model.className && !wrapper ? model.className.join(" ") : "";

  if (value.length > 2) {
    return (
      <div className={className.replace("btn", "")}>
        {value.map(createItem)}
      </div>
    );
  }

  return <div className={className}>{value.map(createItem)}</div>;
};

export default MultilinetextList;
