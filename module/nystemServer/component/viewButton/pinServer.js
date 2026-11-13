import { useContext } from "react";
import { Icon } from "nystem-components";
import { PinnedServersContext } from "../style/pinnedServers";

const ViewButtonPinServer = ({ view }) => {
  const context = useContext(PinnedServersContext);
  if (!context) return null;

  const pinned = context.pinned.has(view.id);
  const label = pinned ? "Unpin server" : "Pin server";

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={pinned}
      className={`pointer-events-none mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded text-white opacity-0 shadow-sm transition-opacity duration-500 ease-in-out focus-visible:pointer-events-auto focus-visible:opacity-100 [.server-overview-row>.pointer:hover_&]:pointer-events-auto [.server-overview-row>.pointer:hover_&]:opacity-100 ${pinned ? "bg-blue-700 hover:bg-blue-600" : "bg-blue-500 hover:bg-blue-400"}`}
      onClick={(event) => {
        event.stopPropagation();
        context.toggle(view.id);
      }}
    >
      <Icon title={false} aria-hidden="true" icon="thumbtack" className={["h-4", "w-4", pinned && "rotate-45"]} />
    </button>
  );
};

export default ViewButtonPinServer;
