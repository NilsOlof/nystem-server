import React from "react";
import { ContentTypeRender } from "nystem-components";

const fallback = {
  type: "bootstrap",
  format: "panel",
  stateStore: "byUrl",
  item: [
    {
      type: "dragAndDrop",
      format: "list",
      field: [
        {
          type: "multigroup",
          id: "testmultigroup",
        },
      ],
      valueType: "multigroup",
      item: [
        {
          type: "bootstrap",
          format: "panel",
          stateStore: "byUrl",
          item: "item",
          header: [
            {
              type: "bootstrap",
              item: [
                {
                  type: "dragAndDrop",
                  format: "handle",
                  icon: true,
                },
                {
                  type: "bootstrap",
                  format: "panelToggle",
                  icon: true,
                  className: ["flex-grow", "flex", "items-center"],
                  item: [
                    {
                      type: "text",
                      id: "testmultigroup._id",
                      format: "view",
                      fallback: "Id",
                    },
                  ],
                },
                {
                  type: "multigroup",
                  id: "testmultigroup",
                  format: "copyItem",
                  direction: "copy",
                  btnSize: "xs",
                  btnType: "info",
                  text: "edit-copy",
                  className: ["mr-1"],
                },
                {
                  type: "multigroup",
                  id: "testmultigroup",
                  format: "addRemove",
                  text: "",
                  action: "Remove",
                  btnSize: "xs",
                  btnType: "danger",
                },
                {
                  type: "multigroup",
                  id: "testmultigroup",
                  format: "panelOpenByValue",
                  invert: true,
                  condition: [],
                  keyCount: 0,
                },
              ],
              className: ["flex", "items-center"],
            },
          ],
          expanded: false,
        },
      ],
      className: ["pt-2", "min-h-2-5", "px-2", "py-1"],
      hoverClassName: ["drop-background", "select-none"],
    },
  ],
  header: [
    {
      type: "bootstrap",
      item: [
        {
          type: "bootstrap",
          format: "panelToggle",
          icon: true,
          item: [
            {
              type: "viewText",
              text: "{name}",
              format: "view",
            },
          ],
          className: ["flex-grow", "flex", "items-center"],
        },
        {
          type: "multigroup",
          id: "testmultigroup",
          format: "copyItem",
          direction: "paste",
          btnSize: "xs",
          btnType: "info",
          text: "paste",
          className: ["mr-1"],
        },
        {
          type: "multigroup",
          id: "testmultigroup",
          format: "addRemove",
          text: "",
          btnSize: "xs",
          btnType: "primary",
          action: "Add",
        },
      ],
      className: ["flex", "items-center", "py-2"],
    },
  ],
  expanded: true,
  typeClass: "defaultWithoutPadding",
};
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
