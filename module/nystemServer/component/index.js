import {
  Inserter,
  Wrapper,
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
        <Inserter match="/" source="/server/overview" />
      </SessionRole>
    </DragAndDropContext>
  </Router>
);
export default Index;
