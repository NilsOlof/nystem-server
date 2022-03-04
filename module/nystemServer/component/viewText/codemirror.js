/* eslint-disable import/extensions */
import React from "react";
import { Wrapper } from "nystem-components";
import CodeMirror from "@uiw/react-codemirror";
import "codemirror/keymap/sublime";
import "codemirror/addon/hint/show-hint";
import "codemirror/addon/hint/sql-hint";
import "codemirror/addon/hint/show-hint.css"; // without this css hints won't show
import "codemirror/addon/search/match-highlighter";
import "codemirror/addon/search/matchesonscrollbar";
import "codemirror/addon/search/searchcursor";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/xml-fold";
import "codemirror/addon/fold/indent-fold";
import "codemirror/addon/fold/markdown-fold";
import "codemirror/addon/fold/comment-fold";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/theme/monokai.css";
import "./codemirror.css";

const ViewTextCodemirror = ({ model, value, setValue }) => (
  <Wrapper className={model.className} renderAs={model.renderAs}>
    <CodeMirror
      value={JSON.stringify(value, null, "  ")}
      options={{
        theme: "monokai",
        keyMap: "sublime",
        mode: "json",
        lineWrapping: true,
        lineNumbers: true,
        foldGutter: true,
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      }}
      onChange={(inst) => {
        const newVal = inst.getValue();

        if (newVal !== JSON.stringify(value, null, "  "))
          setValue(JSON.parse(newVal));
      }}
    />
  </Wrapper>
);

export default ViewTextCodemirror;
// https://uiwjs.github.io/react-codemirror/
