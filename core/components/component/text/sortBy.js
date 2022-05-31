import React, { useContext, useEffect, useState } from "react";
import { Wrapper, DatabaseSearchContext, Icon } from "nystem-components";
import app from "nystem";

const TextSortBy = ({ model, view }) => {
  const { search } = useContext(DatabaseSearchContext);
  const { id, text, className } = model;
  const { sortby, reverse } = search;
  const [ev, setEv] = useState(false);

  const sortbyId = sortby instanceof Array ? sortby[0] : sortby;
  const reverse1 = reverse instanceof Array ? reverse[0] : reverse;

  const handleSort = (event) => {
    if (event) event.preventDefault();

    const rev = sortbyId === id ? !reverse : false;
    const setSearch = (search) => ({
      ...search,
      reverse: rev,
      sortby: id,
    });

    setEv(setSearch);
    view.on("setSearch", 200, setSearch);
    view.event("setSearch");
  };

  useEffect(() => {
    if (!ev) return;

    return () => {
      view.off("setSearch", ev);
      setEv(false);
    };
  }, [ev, view]);

  return (
    <Wrapper
      className={[className, "flex items-center"]}
      renderAs="a"
      href={id}
      onClick={handleSort}
    >
      <Wrapper renderAs="span">{`${app().t(text)} `}</Wrapper>
      {sortbyId === id ? (
        <Icon
          icon={`arrow-${reverse1 ? "up" : "down"}`}
          className="ml-1 h-4 w-4 font-bold"
        />
      ) : null}
    </Wrapper>
  );
};
export default TextSortBy;
