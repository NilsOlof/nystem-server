import React, { useState, useEffect, useRef, useContext } from "react";
import app from "nystem";
import {
  Wrapper,
  DatabaseSearchContext,
  ContentTypeRender,
} from "nystem-components";

const getStyle = (top, extend) => ({
  position: "absolute",
  top: `${top}px`,
  width: "100%",
  ...extend,
});

const ViewListInfiniteSlot = ({ height, slot, model, setSize, view }) => {
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

  if (slot !== 0 && !slotSearch)
    return (
      <div
        className="loading p-4 m-4 rounded-lg shadow h-4 max-w-xl"
        style={getStyle(height * slot)}
      />
    );

  const contents = (
    <div
      ref={ref}
      style={getStyle(height * slot, {
        visibility: height ? "visible" : "hidden",
      })}
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
  const slotsTotal = parseInt((searchTotal || 0) / search.count, 10) || 0;
  const slotLimit = parseInt(model.slotLimit || 3, 10);

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

      const newPos = parseInt(
        (offset(element.scrollY) / (height * slotsTotal)) * slotsTotal,
        10
      );

      if (pos === newPos) return;
      pos = newPos;
      setPos(pos);
    };

    const scrollEvent = () => {
      if (!updateTimer) updateTimer = setTimeout(updateSlots, 200);
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

      element = window;

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

  return (
    <Wrapper
      ref={ref}
      className={model.className}
      style={{ position: "relative", height: `${height * slotsTotal}px` }}
    >
      {slots.map((und, index) => (
        <ViewListInfiniteSlot
          key={index + pos}
          slot={index + pos}
          model={model}
          height={height}
          setSize={(newHeight) => {
            if (height < newHeight) setHeight(newHeight);
          }}
          view={view}
          search={search}
        />
      ))}
    </Wrapper>
  );
};

export default ViewListInfinite;
