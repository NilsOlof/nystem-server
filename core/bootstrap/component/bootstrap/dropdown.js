import { Children, useState } from "react";
import { Button } from "nystem-components";

const BootstrapDropdown = (props) => {
  const [expanded, setExpanded] = useState(props.expanded);

  const children = Children.toArray(props.children);
  const headerProps = children[0]?.props;
  const headerChildren =
    headerProps?.children instanceof Array
      ? headerProps.children.map((item, index) => <div key={index}>{item}</div>)
      : headerProps?.children;
  let typeClass = props.type ? props.type : "";
  if (!headerProps) return null;

  if (props.className) typeClass += ` ${props.className}`;
  if (expanded) typeClass += " open";

  return (
    <div className={`btn-group${typeClass}`}>
      <Button type="secondary" onClick={() => setExpanded((value) => !value)}>
        {headerChildren} <span className="caret" />
      </Button>
      {expanded ? (
        <ul className="dropdown-menu" role="menu">
          {children.slice(1).map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      ) : (
        ""
      )}
    </div>
  );
};
export default BootstrapDropdown;
