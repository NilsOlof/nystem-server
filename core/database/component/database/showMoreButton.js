import { useContext, useState, useEffect } from "react";
import { Button, DatabaseSearchContext } from "nystem-components";

const DatabaseShowMoreButton = ({ model, view }) => {
  const { search } = useContext(DatabaseSearchContext);
  const [count, setCount] = useState();

  useEffect(() => {
    if (!count) return;

    const onSearch = (search) => ({ ...search, count });
    view.on("setSearch", onSearch);
    view.event("setSearch");
    return () => {
      view.off("setSearch", onSearch);
    };
  }, [count, view]);

  if (search.count > search.searchTotal) return null;

  return (
    <Button
      className={model.className}
      type="lsdkfh"
      onClick={() => {
        setCount((count || search.count || 0) + parseInt(model.amount, 10));
      }}
    >
      {model.text}
    </Button>
  );
};

export default DatabaseShowMoreButton;
