import React from "react";

class MultilinetextList extends React.Component {
  render() {
    let { value } = this.props;
    const createItem = function (item, index) {
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
    if (!value) return null;
    if (!(value instanceof Array)) value = [value];
    const { model } = this.props;
    const className =
      model.className && !this.props.wrapper ? model.className.join(" ") : "";
    if (value.length > 2)
      return (
        <div className={className.replace("btn", "")}>
          {value.map(createItem)}
        </div>
      );
    return <div className={className}>{value.map(createItem)}</div>;
  }
}
export default MultilinetextList;
