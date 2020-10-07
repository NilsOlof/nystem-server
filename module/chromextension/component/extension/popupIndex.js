import {
  Inserter,
  Link,
  Wrapper,
  Navbar,
  SessionRole,
  RouterState,
  ConnectionView,
  Image,
} from "nystem-components";
import React from "react";
import app from "nystem";

const url = "hepp";

const ExtensionPopupIndex = () => {
  return (
    <Wrapper>
      <RouterState match="/popup.html" redirect="/" save="storage" />
      <SessionRole userrole="logged-out  ">
        <Inserter
          className="container form"
          match="*"
          source="/adminUser/login"
        />
      </SessionRole>
      <SessionRole className="container-fluid" userrole="logged-in">
        <Navbar fixed="true" color="dark">
          <Link className="navbar-brand" to="/">
            <ConnectionView className="logo">
              <Image width={40} height={30} src={`${url}logo-dark.png`} />
            </ConnectionView>
            <ConnectionView offline="true" className="logo">
              <Image width={40} height={30} src={`${url}logo-light.png`} />
            </ConnectionView>
          </Link>
          <Wrapper className="navbar-nav mr-auto">
            <Link
              className="nav-item nav-link"
              to="/youtubeVideo/incoming"
              match="/youtubeVideo/incoming"
            >
              Incoming
            </Link>
            <Link
              className="nav-item nav-link"
              to="/youtubeVideo/watchLater"
              match="/youtubeVideo/watchLater*"
            >
              Watch later
            </Link>
            <Link
              className="nav-item nav-link"
              to="/youtubeVideo/list"
              match="/youtubeVideo/list"
            >
              Watched
            </Link>
            <Link
              className="nav-item nav-link"
              to="/youtubeVideo/all"
              match="/youtubeVideo/all"
            >
              All
            </Link>
            <a
              className="nav-item nav-link"
              href={`http://${app().settings.domain}`}
              target="_blank"
            >
              Site
            </a>
          </Wrapper>
          <SessionRole userrole="logged-out">
            <Link className="nav-item nav-link" to="/login" match="/login">
              {app().t("Log in")}
            </Link>
          </SessionRole>
        </Navbar>
        <Wrapper id="contentarea" className="col-md-12 contentarea">
          <Inserter match="/" source="/youtubeVideo/incoming" />
          <Inserter match="/youtubeChannel*" />
          <Inserter match="/youtubeVideo/*" />
        </Wrapper>
      </SessionRole>
    </Wrapper>
  );
};
export default ExtensionPopupIndex;
