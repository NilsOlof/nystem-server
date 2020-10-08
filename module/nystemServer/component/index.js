import {
  Wrapper,
  Inserter,
  DragAndDropContext,
  SessionRole,
  ExtensionView,
} from "nystem-components";
import { BrowserRouter as Router } from "react-router-dom";
import React from "react";
import "../../../index.css";
import "./index.css";

const Index = () => (
  <Router>
    <DragAndDropContext>
      <ExtensionView>Hello</ExtensionView>
      <SessionRole userrole="logged-out">
        <Inserter
          className="p-8 text-left"
          match="*"
          source="/adminUser/login"
        />
      </SessionRole>
      <SessionRole userrole="logged-in">
        <Inserter match="*" source="/server/menu" />
        <Inserter match="/" source="/server/overview" />
        <Inserter match="/menu" source="/settings/menu" />
        <Wrapper className="px-6">
          <Inserter match="/server/*" />
          <Inserter match="/host/*" />
          <Inserter match="/settings/*" />
        </Wrapper>
      </SessionRole>
    </DragAndDropContext>
  </Router>
);
export default Index;
