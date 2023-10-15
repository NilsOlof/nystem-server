import { useContext, useEffect, useRef } from "react";
import {
  Wrapper,
  DatabaseSearchContext,
  Icon,
  RouterUseQueryStore,
} from "nystem-components";
import app from "nystem";

const TextSaveSortBy = ({ model, view }) => {
  const { search } = useContext(DatabaseSearchContext);
  const { id, text, className } = model;
  const { sortby, reverse } = search;
  const [ev, setEv] = RouterUseQueryStore(model.saveId);
  const state = useRef();

  const sortbyId = sortby instanceof Array ? sortby[0] : sortby;
  const reverse1 = reverse instanceof Array ? reverse[0] : reverse;
  state.current = ev;

  const handleSort = async (event) => {
    if (event) event.preventDefault();

    const rev = sortbyId === id ? !reverse : true;
    await view.event("clearSort", { id });
    await app().delay(200);
    state.current = rev ? "rev" : "fwd";
    setEv(state.current);
    setTimeout(() => view.event("setSearch"), 100);
  };

  useEffect(() => {
    const clearSort = ({ id: inId }) => {
      if (id !== inId) setEv(undefined);
    };
    view.on("clearSort", clearSort);
    return () => {
      view.off("clearSort", clearSort);
    };
  }, [id, setEv, view]);

  useEffect(() => {
    const setSearch = (search) =>
      state.current
        ? {
            ...search,
            reverse: state.current === "rev",
            sortby: id,
          }
        : search;

    view.on("setSearch", 200, setSearch);

    return () => {
      view.off("setSearch", setSearch);
    };
  }, [id, view]);

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
          icon={`arrow-${reverse1 ? "down" : "up"}`}
          className="ml-1 h-4 w-4 font-bold"
        />
      ) : null}
    </Wrapper>
  );
};
export default TextSaveSortBy;
