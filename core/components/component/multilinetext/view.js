import React from "react";

const MultilinetextView = ({ value }) => {
  if (!value) return null;

  value = value instanceof Array ? value : [value];

  return (
    <div>
      {value.map((item, index) => (
        <div key={index}>
          <a href={`http://${item}`} rel="noopener noreferrer" target="_blank">
            {item}
          </a>
        </div>
      ))}
    </div>
  );
};
export default MultilinetextView;
