import { useEffect } from "react";
import app from "nystem";

const findByType = {
  description: 'meta[name="description"]',
  "og:title": 'meta[property="og:title"]',
  "og:description": 'meta[property="og:description"]',
  "og:url": 'meta[property="og:url"]',
  "og:image": 'meta[property="og:image"]',
};

const getValue = (field) => {
  const obj = document.querySelector(findByType[field]);
  return obj ? obj.getAttribute("content") : "";
};
const setValue = (field, value) => {
  let obj = document.querySelector(findByType[field]);

  if (!obj) {
    const head = document.getElementsByTagName("head")[0];
    obj = document.createElement("meta");
    obj.setAttribute("property", field);
    head.appendChild(obj);
  }

  obj.setAttribute("content", value);
};

const ViewTextPageMeta = ({ model, view, path }) => {
  useEffect(() => {
    const insertVal = (val) => {
      if (!val) return val;

      return val.replace(/\{([a-z0-9_.]+)\}/gim, (str, p1) => {
        if (p1 === "_language") return app().settings.lang;
        if (p1 === "location.href") return window.location.href;
        if (p1 === "location.origin") return window.location.origin;
        if (p1 === "id") return view.id;
        return view.getValue(p1.replace("..", path)) || "{{}}";
      });
    };

    const fieldValue = insertVal(model.fieldFormat);

    if (!fieldValue || fieldValue.indexOf("{{}}") !== -1) return;

    let oldValue;
    if (model.field === "title") {
      oldValue = document.title;
      document.title = fieldValue;
    } else {
      oldValue = getValue(model.field);

      setValue(model.field, fieldValue);
    }

    return () => {
      if (model.field === "title") document.title = oldValue;
      else setValue(model.field, oldValue);
    };
  }, [model, path, view]);

  return null;
};
export default ViewTextPageMeta;

// {location.origin}/image/{content.0.image.0.id}.{content.0.image.0.ext}
