import React, { useContext } from "react";
import { Wrapper, DatabaseSearchContext, Icon } from "nystem-components";
import app from "nystem";

const TextSortBy = ({ model }) => {
  const { search, setSearch } = useContext(DatabaseSearchContext);
  const { id, text, className = [] } = model;
  const { sortby, reverse } = search;

  const sortbyId = sortby instanceof Array ? sortby[0] : sortby;

  const handleSort = event => {
    if (event) event.preventDefault();

    setSearch({
      ...search,
      reverse: sortbyId === id ? !reverse : reverse,
      sortby: id
    });
  };

  return (
    <Wrapper
      className={[...className, "flex"]}
      renderAs="a"
      href={id}
      onClick={handleSort}
    >
      <Wrapper renderAs="span">{`${app().t(text)} `}</Wrapper>
      {sortbyId === id ? (
        <Icon
          icon={`arrow-${reverse ? "up" : "down"}`}
          className="ml-2 w-4 font-bold"
        />
      ) : null}
    </Wrapper>
  );
};
export default TextSortBy;
