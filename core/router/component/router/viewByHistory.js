import React from "react";
import { Wrapper, ContentTypeRender } from "nystem-components";
import app from "nystem";

const sortFuncInt = (key) => (a, b) => {
  const x = a[key];
  const y = b[key];
  if (x === undefined) return y === undefined ? 0 : 1;
  if (y === undefined) return -1;
  return x < y ? -1 : x > y ? 1 : 0;
};

const historyPos = (test) => {
  const { history, at } = app().routerHistory;

  const slice = history.slice(0, at);
  slice.reverse();

  const pos = slice.reduce((result, { pathname }, index) => {
    if (result) return result;

    if (test === "/") {
      if (pathname === "/") return slice.length - index + 1;
    } else if (new RegExp(test).test(pathname)) return slice.length - index + 1;

    return 0;
  }, 0);

  return pos;
};

const RouterViewByHistory = ({ model, path }) => {
  model = model || {};
  const { className, renderAs, items } = model;

  const itemsByPosition = items.map((item) => ({
    ...item,
    pos: item.paths.reduce((res, path) => {
      const pos = historyPos(path);
      return pos > res ? pos : res;
    }, 0),
  }));

  itemsByPosition.sort(sortFuncInt("pos"));
  itemsByPosition.reverse();

  return (
    <Wrapper className={className} renderAs={renderAs}>
      <ContentTypeRender
        path={path}
        items={itemsByPosition.reduce(
          (res, item) => [...res, ...item.item],
          []
        )}
      />
    </Wrapper>
  );
};

export default RouterViewByHistory;
