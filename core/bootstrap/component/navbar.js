import React, { useState } from "react";
import { Button } from "nystem-components";

const Navbar = ({
  fixed = " fixed-top",
  size = "md",
  color = "light",
  children
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <nav
      className={`navbar navbar-expand-md ${color} flex-${size}-row bd-navbar ${fixed}`}
    >
      {children[0]}
      <Button
        className="navbar-toggler navbar-toggler-right"
        onClick={() => setExpanded(!expanded)}
        aria-hidden="true"
      >
        <span className="navbar-toggler-icon" />
      </Button>
      <div
        onClick={() => setExpanded(!expanded)}
        className={
          expanded
            ? "navbar-collapse collapse show"
            : "navbar-collapse collapse"
        }
      >
        {children.slice(1)}
      </div>
    </nav>
  );
};
export default Navbar;
