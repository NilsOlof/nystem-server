import React from "react";

class MultilinetextView extends React.Component {
  render() {
    let { value } = this.props;
    const createItem = function(item, index) {
      return (
        <div key={index}>
          <a href={`http://${item}`} rel="noopener noreferrer" target="_blank">
            {item}
          </a>
        </div>
      );
    };
    if (!value) return null;
    if (!(value instanceof Array)) value = [value];
    return <div>{value.map(createItem)}</div>;
  }
}
export default MultilinetextView;
