/* eslint-disable space-in-parens */
import { useState, useEffect, useRef, useContext } from "react";
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
    if (
      overflowRegex.test(overflow + overflowY + overflowX) &&
      overflowX !== "hidden"
    )
      return parent;
  }

  return document.body;
}

const SlotContent = ({ slot, model, view }) => {
  const context = useContext(DatabaseSearchContext);
  const [slotSearch, setSlotSearch] = useState(false);

  useEffect(() => {
    if (slot === 0) return;
    let mounted = true;
    setSlotSearch(false);
    const db = app().database[view.contentType];

    const timer = setTimeout(() => {
      db.search({
        ...context.search,
        position: slot * context.search.count,
        data: undefined,
      }).then((search) => mounted && search.data && setSlotSearch(search));
    }, model.searchDelay || 100);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [context.search, model.searchDelay, slot, view.contentType]);

  if (slot !== 0 && !slotSearch)
    return <div className="loading m-4 h-4 max-w-xl rounded-lg p-4 shadow" />;

  if (slot !== 0 && context.search.count * slot === context.search.searchTotal)
    return null;

  if (slot === 0)
    return <ContentTypeRender path={model.path} items={model.item} />;

  return (
    <DatabaseSearchContext.Provider value={{ search: slotSearch }}>
      <ContentTypeRender path={model.path} items={model.item} />
    </DatabaseSearchContext.Provider>
  );
};

const InfiniteSlot = ({ slot, model, view }) => {
  const ref = useRef();
  const [top, setTop] = useState();

  useEffect(() => {
    const element = ref.current;
    let setViewListHeight;
    let ro;

    view.event("getViewListHeight", { slot }).then(({ height }) => {
      setViewListHeight = (query) => {
        query.slotHeights[slot] = height;

        if (query.top < height) query.top = height;
        let top = 0;
        for (let pos = 0; pos < slot; pos++)
          top += query.slotHeights[pos] || query.top;

        setTop(top);
        return query;
      };
      ro = new ResizeObserver(() => {
        const newH = element.offsetHeight;
        if (newH < 10 || newH < height) return;

        height = newH;
        view.event("setViewListHeight");
      });
      ro.observe(element);

      view.on("setViewListHeight", -slot, setViewListHeight);
    });

    return () => {
      view.off("setViewListHeight", setViewListHeight);
      if (ro) ro.unobserve(element);
    };
  }, [slot, view]);

  return (
    <div
      ref={ref}
      style={{ position: "absolute", top: `${top}px`, width: "100%" }}
    >
      <SlotContent slot={slot} model={model} view={view} />
    </div>
  );
};

const ViewListDynamicInfinite = ({ view, model }) => {
  const { search, loading } = useContext(DatabaseSearchContext);
  const { searchTotal } = search;
  const ref = useRef();
  const [slotCount, setSlotCount] = useState(0);

  const [pos, setPos] = useState(0);
  const [heightTotal, setHeightTotal] = useState(0);
  const heights = useRef([]);

  const slotsTotal = parseInt(
    Math.trunc((searchTotal || 0) / (search.count || 1)) + 1,
    10
  );
  let slotLimit = parseInt(slotCount || model.slotLimit || 3, 10);
  if (slotLimit > slotsTotal) slotLimit = slotsTotal;

  useEffect(() => {
    if (!slotsTotal) return;
    view.event("infiniteScrollPos", { pos, total: slotsTotal - slotLimit + 1 });
  }, [pos, slotLimit, slotsTotal, view]);

  useEffect(() => {
    let pos = 0;
    let top = 0;
    let innerHeight = 0;
    const { slotMinHeight = 20 } = model;
    const slotHeights = new Array(slotsTotal);
    heights.current = slotHeights;
    let height = 0;
    const offset = (height) => (height < top ? 0 : height - top);
    let slotCount = 0;

    let updateTimer = false;
    const updateSlots = () => {
      clearTimeout(updateTimer);
      updateTimer = false;

      if (!element) return;
      const top = offset(element.scrollY || element.scrollTop || 0);
      const bottom = top + innerHeight;

      let topPos = 0;
      let newPos = 0;
      let toPos = 0;
      while (newPos < slotsTotal && topPos < bottom + 200 && toPos < 5555000) {
        topPos += slotHeights[newPos] || height || slotMinHeight;
        if (topPos < top) newPos++;
        toPos++;
      }
      newPos -= 2;
      if (newPos < 0) newPos = 0;

      if (pos !== newPos) setPos(newPos);
      pos = newPos;
      if (toPos - pos !== slotCount) setSlotCount(toPos - pos);
      slotCount = toPos - pos;
    };

    const scrollEvent = () => {
      if (!updateTimer) updateTimer = setTimeout(updateSlots, 200);
    };

    let timer = false;
    let element = false;
    const start = () => {
      element = ref.current;
      if (!element) {
        timer = setTimeout(start, 20);
        return;
      }
      const { top: newTop } = element.getBoundingClientRect();
      if (newTop > 0) top = newTop;

      element = getScrollParent(element, true);
      if (element === window.document.body) {
        element = window;
        // eslint-disable-next-line prefer-destructuring
        innerHeight = window.innerHeight;
      } else innerHeight = window.innerHeight - top;

      element.addEventListener("scroll", scrollEvent);
    };
    start();

    const setViewListHeight = () => ({ innerHeight, slotHeights, top: 0 });
    view.on("setViewListHeight", 1000, setViewListHeight);

    const getViewListHeight = ({ slot }) => ({
      slot,
      height: slotHeights[slot],
    });
    view.on("getViewListHeight", getViewListHeight);

    let heightTimer = false;
    const setHeight = () => {
      let totHeight = 0;

      for (let i = 0; i < slotsTotal; i++)
        totHeight += slotHeights[i] || height || slotMinHeight;

      setHeightTotal(totHeight);
      heightTimer = false;
      if (!updateTimer) updateTimer = setTimeout(updateSlots, 200);
    };

    const setViewListHeightTotal = ({ top }) => {
      if (!heightTimer) heightTimer = setTimeout(setHeight, 200);
      height = top;
    };
    view.on("setViewListHeight", -1000, setViewListHeightTotal);

    return () => {
      if (timer) clearTimeout(timer);
      if (updateTimer) clearTimeout(updateTimer);

      view.off("getViewListHeight", getViewListHeight);
      view.off("setViewListHeight", setViewListHeight);
      view.off("setViewListHeight", setViewListHeightTotal);

      if (!element) return;
      element.removeEventListener("scroll", scrollEvent);
    };
  }, [model, search, slotsTotal, view]);

  if (loading) return null;

  const slots = [];
  for (let count = pos; count === 0 || slotLimit + pos > count; count++)
    slots.push(
      <InfiniteSlot
        key={`${slotsTotal}_${count}`}
        slot={count}
        model={model}
        view={view}
      />
    );

  return (
    <Wrapper
      ref={ref}
      className={model.className}
      style={{
        position: "relative",
        height: `${heightTotal}px`,
      }}
    >
      {slots}
    </Wrapper>
  );
};

export default ViewListDynamicInfinite;
