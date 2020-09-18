import React from "react";
import app from "nystem";
import { Panel, ContentTypeRender } from "nystem-components";

const GroupInput = ({ model, path }) => {
  const { text, item } = model;
  return (
    <Panel
      type="default"
      expanded={true}
      header={app().t(text)}
      body={<ContentTypeRender path={path} items={item} />}
    />
  );
};
export default GroupInput;
