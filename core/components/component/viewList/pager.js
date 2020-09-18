import React, { useContext } from "react";
import { Wrapper, DatabaseSearchContext, Button } from "nystem-components";
import app from "nystem";

const ViewListPager = ({ view, model }) => {
  const { search, setSearch } = useContext(DatabaseSearchContext);
  const update = (e, move) => {
    if (move === -1) search.position = prev(search);
    if (move === 1) search.position = next(search);
    setSearch(search);
  };

  const prev = search =>
    search.position !== 0 ? search.position - search.count : -1;
  const next = search =>
    search.position + search.count < search.searchTotal
      ? search.position + search.count
      : -1;

  const className = model.className ? model.className.join(" ") : "";
  const hasPrev = prev(search) !== -1;
  const hasNext = next(search) !== -1;

  return (
    <Wrapper renderAs="ul" className={`${className} flex py-4`}>
      <Button
        disabled={!hasPrev && "disabled"}
        className="mr-2"
        onClick={hasPrev ? e => update(e, -1) : undefined}
      >
        ← {app().t("Previous")}
      </Button>
      <Button
        disabled={!hasNext && "disabled"}
        onClick={hasNext ? e => update(e, 1) : undefined}
      >
        {app().t("Next")} →
      </Button>
    </Wrapper>
  );
};

export default ViewListPager;
