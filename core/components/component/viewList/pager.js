import { useEffect, useRef, useContext } from "react";
import {
  Button,
  Wrapper,
  RouterUseQueryStore,
  DatabaseSearchContext,
  UseLocation,
} from "nystem-components";

import app from "nystem";

const ViewListPager = ({ view, model }) => {
  const { search } = useContext(DatabaseSearchContext);
  const [value, setValue, ref] = RouterUseQueryStore(model.saveId, "int", true);
  const location = UseLocation();

  const last = useRef(false);

  useEffect(() => {
    if (!value && !last.current) return;

    const setSearch = (query) => {
      if (!value) return;
      query.position = value;
    };
    if (value) view.on("setSearch", setSearch);
    view.event("setSearch");

    last.current = value;
    return () => {
      if (value) view.off("setSearch", setSearch);
    };
  }, [value, view]);

  const relUrl = (value) => {
    const { saveId } = model;

    if (!saveId) return;

    const { pathname, search } = location;

    const reg = `(^\\?)|(\\&${saveId}=[^\\s&]*)`;
    const rest = search.replace(new RegExp(reg, "gi"), "");
    const add = value ? `&${saveId}=${value}` : "";

    return `${pathname}?${rest}${add}`;
  };

  const update = (move) => {
    if (move === -1) setValue(prev(search));
    if (move === 1) setValue(next(search));
  };

  const prev = () =>
    search.position !== 0 ? search.position - search.count : -1;
  const next = () =>
    search.position + search.count < search.searchTotal
      ? search.position + search.count
      : -1;

  const hasPrev = prev() !== -1;
  const hasNext = next() !== -1;

  return (
    <Wrapper ref={ref} className={[model.className, "flex", "py-4"]}>
      <Button
        renderAs="a"
        disabled={!hasPrev && "disabled"}
        className="mr-2"
        onClick={hasPrev ? () => update(-1) : undefined}
        href={hasPrev ? relUrl(prev(search)) : undefined}
      >
        ← {app().t("Previous")}
      </Button>
      <Button
        renderAs="a"
        disabled={!hasNext && "disabled"}
        onClick={hasNext ? () => update(1) : undefined}
        href={hasNext ? relUrl(next(search)) : undefined}
      >
        {app().t("Next")} →
      </Button>
    </Wrapper>
  );
};

export default ViewListPager;
