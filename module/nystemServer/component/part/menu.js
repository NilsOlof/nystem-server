import { Link } from "nystem-components";
import React from "react";

const NavbarLink = ({ children, ...props }) => {
  const classNames =
    "block px-5 py-1 text-white font-semibold rounded hover:bg-gray-800";

  return (
    <Link {...props} className={`${classNames} ${props.className || ""}`}>
      {children}
    </Link>
  );
};

const PartMenu = () => {
  return (
    <header className="bg-gray-900 sm:flex sm:justify-between sm:items-center py-2">
      <div className="flex items-center justify-around px-2 py-1 sm:p-0 flex-grow">
        <NavbarLink to="/">Nystem</NavbarLink>
        <NavbarLink to="/contentType/list" match="/contentType/list*">
          Content type
        </NavbarLink>
        <NavbarLink to="/field/list" match="/field/list">
          Fields
        </NavbarLink>
        <NavbarLink to="/view/list" match="/view/list*">
          Views
        </NavbarLink>
        <NavbarLink to="/component/list" match="/component/list*">
          Component
        </NavbarLink>
        <NavbarLink to="/componentFormat/list" match="/componentFormat/list*">
          Component format
        </NavbarLink>
        <NavbarLink to="/module/list" match="/module/list*">
          Module
        </NavbarLink>
      </div>
    </header>
  );
};

export default PartMenu;
