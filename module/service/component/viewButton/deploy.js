import React, { useContext, useEffect, useState } from "react";
import app from "nystem";
import { Icon, PanelContext, Wrapper } from "nystem-components";

const ViewButtonDeploy = ({ model, view }) => {
  const panel = useContext(PanelContext);
  const openKey = `serverPanelOpen${view.id}`;
  const [open, setOpen] = useState(() => sessionStorage.getItem(openKey) || "");

  useEffect(() => {
    const toggle = ({ open }) => setOpen(open);
    app.connection.on(`serverPanel${view.id}`, toggle);
    return () => app.connection.off(`serverPanel${view.id}`, toggle);
  }, [view.id]);

  const openPanel = (event, toggle) => {
    event.preventDefault();
    event.stopPropagation();
    const rowToggle = event.currentTarget.closest(".pointer")?.querySelector('[role="button"]');
    const rowCollapsed = rowToggle?.querySelector("svg title")?.textContent === "chevron-right";
    const panelCollapsed = !rowToggle && panel?.expanded === false;
    const nextOpen = !toggle || rowCollapsed || panelCollapsed || open !== "tasks" ? "tasks" : "";
    sessionStorage.setItem(openKey, nextOpen);
    setOpen(nextOpen);
    if (rowCollapsed || (!nextOpen && rowToggle)) rowToggle.click();
    else if (panelCollapsed) panel.toggleExpand();
    app.connection.event(`serverPanel${view.id}`, { open: nextOpen });
  };

  return (
    <div className="inline-flex items-center gap-1 mr-1">
      <Wrapper
        renderAs="button"
        type="button"
        title="Project actions"
        aria-label="Project actions"
        aria-expanded={open === "tasks"}
        className={[...(model.className || []), "h-8 w-8", open === "tasks" ? "ring-2 ring-white bg-blue-700" : ""]}
        onClick={(event) => openPanel(event, true)}
      >
        <Icon icon={model.icon || "screwdriver-wrench"} className={["h-4", "w-4"]} />
      </Wrapper>
      <button
        type="button"
        title="Git changes"
        aria-label="Git changes"
        className={[
          ...(model.className || []).filter((className) => className !== "inline-flex"),
          "h-8 w-8 hidden min-[1440px]:[.server-overview-layout_&]:inline-flex",
        ].join(" ")}
        onClick={(event) => {
          openPanel(event, false);
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
        title="Git changes"
        aria-label="Git changes"
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
