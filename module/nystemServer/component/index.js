import { Inserter, Wrapper, DragAndDropContext } from "nystem-components";
import { BrowserRouter as Router } from "react-router-dom";
import React from "react";
import "../../../index.css";
import "./index.css";

const Index = () => (
  <Router>
    <DragAndDropContext>
      <Wrapper className="flex">
        <Wrapper className="w-64 shadow-xl mr-10 pb-4">
          <Inserter match="*" source="/settings/hostname/host" />
          <Inserter match="*" source="/contentType/inMenu" />
          <Inserter match="*/fields/*" source="/componentFormat/fieldSelect" />
          <Inserter
            match="/view/input/*"
            source="/view/fieldsInContentType/*"
          />
          <Inserter
            match="/view/input/*"
            source="/componentFormat/viewSelect"
          />
        </Wrapper>
        <Wrapper className="w-3/4">
          <Inserter match="/view/*" />
          <Inserter match="/module/*" />
          <Inserter match="/contentType/*" />
          <Inserter match="/component/*" />
          <Inserter match="/field/*" />
          <Inserter match="/componentFormat/*" />
          <Inserter match="/" source="/settings/view/host" />
        </Wrapper>
      </Wrapper>
    </DragAndDropContext>
  </Router>
);
export default Index;
