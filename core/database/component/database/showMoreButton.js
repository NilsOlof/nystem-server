import React, { useContext } from "react";
import { Button, DatabaseSearchContext } from "nystem-components";

const DatabaseShowMoreButton = ({ model }) => {
  const { search, setSearch } = useContext(DatabaseSearchContext);

  if (search.count > search.searchTotal) return null;

  return (
    <Button
      className={model.className}
      type="lsdkfh"
      onClick={() => {
        setSearch({
          ...search,
          count: search.count + parseInt(model.amount, 10),
        });
      }}
    >
      {model.text}
    </Button>
  );
};

export default DatabaseShowMoreButton;
