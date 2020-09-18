import React from "react";
import { Wrapper, OverlayClose } from "nystem-components";
import "./menu.css";

const OverlayMenu = ({ children }) => (
  <Wrapper
    className="overlay-menu-container overlay-menu-container--active"
    id="overlay-menu-container"
  >
    <OverlayClose className="overlay-menu-shim" renderAs="a" accessible={false}>
      {" "}
    </OverlayClose>
    <Wrapper renderAs="nav" className="overlay-menu">
      {children}
    </Wrapper>
  </Wrapper>
);

export default OverlayMenu;
