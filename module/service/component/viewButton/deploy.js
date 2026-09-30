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

  return (
    <div className="inline-flex items-center gap-1 mr-1">
      {[
        { id: "tasks", title: "Project actions", icon: model.icon || "screwdriver-wrench" },
        { id: "log", title: "Process log", icon: "terminal" },
      ].map(({ id, title, icon }) => (
        <Wrapper
          key={id}
          renderAs="button"
          type="button"
          title={title}
          aria-label={title}
          aria-expanded={open === id}
          className={[
            ...(model.className || []),
            "h-8 w-8",
            open === id ? "ring-2 ring-white bg-blue-700" : "",
          ]}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            const rowToggle = event.currentTarget.closest(".pointer")?.querySelector('[role="button"]');
            const rowCollapsed = rowToggle?.querySelector("svg title")?.textContent === "chevron-right";
            const panelCollapsed = !rowToggle && panel?.expanded === false;
            const nextOpen = rowCollapsed || panelCollapsed || open !== id ? id : "";
            sessionStorage.setItem(openKey, nextOpen);
            setOpen(nextOpen);
            if (rowCollapsed || (!nextOpen && rowToggle)) rowToggle.click();
            else if (panelCollapsed) panel.toggleExpand();
            app.connection.event(`serverPanel${view.id}`, { open: nextOpen });
          }}
        >
          <Icon icon={icon} className={["h-4", "w-4"]} />
        </Wrapper>
      ))}
    </div>
  );
};

export default ViewButtonDeploy;
