import {
  Wrapper,
  Inserter,
  DragAndDropContext,
  SessionRole,
} from "nystem-components";
import { BrowserRouter as Router } from "react-router-dom";
import React from "react";
import "../../../index.css";
import "./index.css";

const Index = () => (
  <Router>
    <DragAndDropContext>
      <SessionRole userrole="logged-out">
        <Inserter
          className="p-8 text-left"
          match="*"
          source="/adminUser/login"
        />
      </SessionRole>
      <SessionRole userrole="logged-in">
        <Inserter
          className="fixed top-0 w-full"
          match="*"
          source="/server/menu"
          exclude="/devtools.html"
        />
        <Inserter match="/devtools.html" source="/server/devtools" />
        <Wrapper
          renderAs="main"
          className="h-full-minus mt-11 overflow-y-scroll"
        >
          <Inserter match="/popup.html" source="/server/extension" />
          <Inserter match="/" source="/server/overview" />
          <Inserter match="/menu" source="/settings/menu" />
          <Wrapper className="px-6">
            <Inserter match="/server/*" />
            <Inserter match="/host/*" />
            <Inserter match="/settings/*" />
          </Wrapper>
        </Wrapper>
      </SessionRole>
    </DragAndDropContext>
  </Router>
);
export default Index;
