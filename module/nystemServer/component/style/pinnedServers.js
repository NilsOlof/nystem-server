import { createContext, useContext, useState } from "react";
import { ContentTypeRender, DatabaseSearchContext } from "nystem-components";

export const PinnedServersContext = createContext(null);

const StylePinnedServers = ({ model, path }) => {
  const [pinned, setPinned] = useState(
    () => new Set((localStorage.getItem("pinnedServers") || "").split(",").filter(Boolean)),
  );
  const context = useContext(DatabaseSearchContext);
  const { search } = context;

  return (
    <PinnedServersContext.Provider
      value={{
        pinned,
        toggle(id) {
          const next = new Set(pinned);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          localStorage.setItem("pinnedServers", [...next].join(","));
          setPinned(next);
        },
      }}
    >
      <DatabaseSearchContext.Provider
        value={{
          ...context,
          search: {
            ...search,
            data:
              search.data &&
              [...search.data].sort((a, b) => Number(pinned.has(b._id ?? b)) - Number(pinned.has(a._id ?? a))),
          },
        }}
      >
        <ContentTypeRender path={path} items={model.item} />
      </DatabaseSearchContext.Provider>
    </PinnedServersContext.Provider>
  );
};

export default StylePinnedServers;
