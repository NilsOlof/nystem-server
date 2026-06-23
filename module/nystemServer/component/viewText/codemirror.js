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
import "codemirror/mode/javascript/javascript";
import "codemirror/theme/monokai.css";
import "./codemirror.css";

const ViewTextCodemirror = ({ model, value, setValue }) => {
  const formattedValue = JSON.stringify(value, null, "  ") || "";

  return (
    <Wrapper className={model.className} renderAs={model.renderAs}>
      <CodeMirror
        value={formattedValue}
        options={{
          theme: "monokai",
          keyMap: "sublime",
          mode: { name: "javascript", json: true },
          lineWrapping: true,
          lineNumbers: true,
          foldGutter: true,
          gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
        }}
        onChange={(inst) => {
          const newVal = inst.getValue();

          if (newVal === formattedValue) return;

          try {
            setValue(JSON.parse(newVal));
          } catch {
            // Keep the editor responsive while the JSON is temporarily invalid.
          }
        }}
      />
    </Wrapper>
  );
};

export default ViewTextCodemirror;
// https://uiwjs.github.io/react-codemirror/
