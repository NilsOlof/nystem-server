import React from "react";
import app from "nystem";
import { Icon } from "nystem-components";

const ViewButtonDeploy = ({ model, view }) => {
  return (
    <div className="inline-flex items-center">
      <button
        type="button"
        title="Git workspace"
        aria-label="Git workspace"
        className={[
          ...(model.className || []).filter((className) => className !== "inline-flex"),
          "h-8 w-8 hidden min-[1440px]:[.server-overview-layout_&]:inline-flex",
        ].join(" ")}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          app.event("serverOverviewOpenGit", { serverId: view.id });
        }}
      >
        <Icon title={false} aria-hidden="true" icon="code-branch" className={["h-4", "w-4"]} />
      </button>
      <a
        href={
          new URL(
            `/server/git/${view.id}`,
            window.location.protocol === "chrome-extension:"
              ? `http${app.settings.secure ? "s" : ""}://${app.settings.domain}`
              : window.location.origin,
          ).href
        }
        target="_blank"
        rel="noopener noreferrer"
        title="Git workspace"
        aria-label="Git workspace"
        className={[
          ...(model.className || []),
          "h-8 w-8 inline-flex min-[1440px]:[.server-overview-layout_&]:hidden",
        ].join(" ")}
      >
        <Icon title={false} aria-hidden="true" icon="code-branch" className={["h-4", "w-4"]} />
      </a>
    </div>
  );
};

export default ViewButtonDeploy;
