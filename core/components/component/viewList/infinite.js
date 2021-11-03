/* eslint-disable space-in-parens */
import React, { useState, useEffect, useRef, useContext } from "react";
import app from "nystem";
import {
  Wrapper,
  DatabaseSearchContext,
  ContentTypeRender,
} from "nystem-components";

function getScrollParent(element, includeHidden) {
  let { position, overflowY, overflowX, overflow } = getComputedStyle(element);
  const overflowRegex = includeHidden
    ? /(auto|scroll|hidden)/
    : /(auto|scroll)/;

  if (position === "fixed") return document.body;

  // eslint-disable-next-line no-cond-assign
  for (let parent = element; (parent = parent.parentElement); ) {
    ({ position, overflowY, overflowX, overflow } = getComputedStyle(parent));

    if (position === "absolute" && position === "static") continue;
    if (overflowRegex.test(overflow + overflowY + overflowX)) return parent;
  }

  return document.body;
}

const getStyle = (top, extend) => ({
  position: "absolute",
  top: `${top}px`,
  width: "100%",
  ...extend,
});

const ViewListInfiniteSlot = ({ pos, hidden, slot, model, setSize, view }) => {
  const context = useContext(DatabaseSearchContext);
  const [slotSearch, setSlotSearch] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (slot === 0) return;
    const db = app().database[view.contentType];

    const timer = setTimeout(() => {
      db.search({
        ...context.search,
        position: slot * context.search.count,
        data: undefined,
      }).then((search) => search.data && setSlotSearch(search));
    }, model.searchDelay || 10);
    return () => {
      clearTimeout(timer);
    };
  }, [context.search, model.searchDelay, slot, view.contentType]);

  useEffect(() => {
    const setHeight = () => {
      if (ref.current && ref.current.offsetHeight)
        setSize(ref.current.offsetHeight);
      else setTimeout(setHeight, 20);
    };
    setTimeout(setHeight, 0);
  }, [setSize]);

  if (slot !== 0 && context.search.count * slot === context.search.searchTotal)
    return null;

  if (slot !== 0 && !slotSearch)
    return (
      <div
        className="loading p-4 m-4 rounded-lg shadow h-4 max-w-xl"
        style={getStyle(pos)}
      />
    );

  const contents = (
    <div
      ref={ref}
      style={getStyle(pos, { visibility: hidden ? "hidden" : "visible" })}
    >
      <ContentTypeRender path={model.path} items={model.item} />
    </div>
  );

  if (slot === 0) return contents;

  return (
    <DatabaseSearchContext.Provider value={{ search: slotSearch }}>
      {contents}
    </DatabaseSearchContext.Provider>
  );
};

const ViewListInfinite = ({ view, model }) => {
  const { search, loading } = useContext(DatabaseSearchContext);
  const { searchTotal } = search;
  const ref = useRef();

  const [pos, setPos] = useState(0);
  const [height, setHeight] = useState(0);
  const heightRef = useRef();
  heightRef.current = height;
  const slotHeights = useRef({});
  if (!height) slotHeights.current = {};

  const slotsTotal = parseInt((searchTotal || 0) / search.count, 10) || 0;
  const slotLimit = parseInt(model.slotLimit || 3, 10);

  useEffect(() => {
    if (model.clearHeightOnUpdate) setHeight(0);
  }, [model, searchTotal]);

  useEffect(() => {
    if (!slotsTotal) return;
    view.event("infiniteScrollPos", { pos, total: slotsTotal - slotLimit + 1 });
  }, [pos, slotLimit, slotsTotal, view]);

  useEffect(() => {
    let updateTimer = false;
    let pos = 0;
    let element = false;
    let top = 0;
    let timer = false;
    const offset = (height) => (height < top ? 0 : height - top);

    const updateSlots = () => {
      clearTimeout(updateTimer);
      updateTimer = false;

      const top = element.scrollY || element.scrollTop || 0;

      const newPos =
        parseInt((offset(top) / (height * slotsTotal)) * slotsTotal, 10) || 0;

      if (pos === newPos) return;
      pos = newPos;
      setPos(pos);
    };

    const scrollEvent = () => {
      if (!updateTimer)
        updateTimer = setTimeout(updateSlots, model.slotUpdateDelay || 200);
    };

    let width = window.innerWidth;
    const resizeEvent = () => {
      if (width === window.innerWidth) return;

      width = window.innerWidth;
      scrollEvent();
      setHeight(0);
    };

    const start = () => {
      element = ref.current;
      if (!element) {
        timer = setTimeout(start, 20);
        return;
      }
      const { top: newTop } = element.getBoundingClientRect();
      if (newTop > 0) top = newTop;

      element = getScrollParent(element, true);
      if (element === window.document.body) element = window;

      element.addEventListener("scroll", scrollEvent);
      element.addEventListener("resize", resizeEvent);
    };
    start();

    return () => {
      if (timer) clearTimeout(timer);
      if (updateTimer) clearTimeout(updateTimer);
      if (!element) return;

      element.removeEventListener("scroll", scrollEvent);
      element.removeEventListener("resize", resizeEvent);
    };
  }, [height, model, search.count, search.searchTotal, slotsTotal]);

  if (loading) return null;

  const slots = Array(
    slotsTotal - pos < slotLimit - 1 ? slotsTotal - pos + 1 : slotLimit
  ).fill();

  let at = pos * height;
  const getPos = () => {
    const old = at;
    at += height;
    return old;
  };

  return (
    <Wrapper
      ref={ref}
      className={model.className}
      style={{
        position: "relative",
        height: `${height * (slotsTotal || slots.length)}px`,
      }}
    >
      {slots.map((und, index) => (
        <ViewListInfiniteSlot
          key={index + pos}
          pos={getPos(index + pos)}
          slot={index + pos}
          model={model}
          hidden={height === 0}
          setSize={(newHeight) => {
            slotHeights.current[index + pos] = newHeight;

            if (heightRef.current < newHeight) setHeight(newHeight);
          }}
          view={view}
          search={search}
        />
      ))}
    </Wrapper>
  );
};

export default ViewListInfinite;
