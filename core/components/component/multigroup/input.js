import React from "react";
import { ContentTypeRender } from "nystem-components";
import { fallback } from "./input.json";
// http://manager.localhost:9154/view/input/view_testmultigroup

const replaceInObject = (item, fn) => {
  if (item instanceof Array)
    return item.map((item) => replaceInObject(item, fn));

  if (typeof item === "object") {
    item = fn(item);

    Object.entries(item).forEach(([key, value]) => {
      item[key] = replaceInObject(value, fn);
    });
  }
  return item;
};

const MultigroupInput = ({ model, path }) => {
  const item = replaceInObject(fallback, (item) => {
    if (item.id && item.id.startsWith("testmultigroup"))
      return item.id === "testmultigroup._id"
        ? model.header
          ? { type: "style", item: model.header }
          : { ...item, id: `${model.idField || "_id"}` }
        : { ...item, id: item.id.replace("testmultigroup", model.id) };

    if (item.item === "item")
      return {
        ...item,
        item: model.item.map((field) => ({
          ...field,
          id:
            field.id && field.id.includes(".")
              ? field.id
              : `${model.id}.${field.id}`,
        })),
      };

    if (item.text === "{name}") return { ...item, text: model.text };
    return { ...item };
  });

  return <ContentTypeRender path={path} items={[item]} />;
};
export default MultigroupInput;
