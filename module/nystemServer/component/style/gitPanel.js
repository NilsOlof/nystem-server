import React, { useEffect, useState } from "react";
import { Wrapper, ContentTypeView, ContentTypeRender } from "nystem-components";
import app from "nystem";

const GitPanelLayout = ({ model, path }) => {
  const [width, setWidth] = useState(() => Number(localStorage.getItem("serverOverviewWidth")) || 896);

  const resize = (width) => setWidth(Math.max(384, Math.min(window.innerWidth - 492, width)));

  useEffect(() => {
    localStorage.setItem("serverOverviewWidth", width);
  }, [width]);

  useEffect(() => {
    const onResize = () => setWidth((width) => Math.max(384, Math.min(window.innerWidth - 492, width)));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <Wrapper className={model.className} style={{ "--server-overview-width": `${width}px` }}>
      <ContentTypeRender path={path} items={model.item} />
      <div
        role="separator"
        aria-label="Resize project list and workspace"
        aria-orientation="vertical"
        aria-valuemin={384}
        aria-valuemax={window.innerWidth - 492}
        aria-valuenow={width}
        tabIndex={0}
        className="server-overview-divider"
        onPointerDown={(event) => {
          event.preventDefault();
          event.currentTarget.setPointerCapture(event.pointerId);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) resize(event.clientX);
        }}
        onPointerUp={(event) => event.currentTarget.releasePointerCapture(event.pointerId)}
        onKeyDown={(event) => {
          if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
          event.preventDefault();
          resize(width + (event.key === "ArrowLeft" ? -16 : 16));
        }}
      />
    </Wrapper>
  );
};

const StyleGitPanel = ({ model, view, path }) => {
  const [serverId, setServerId] = useState(null);

  useEffect(() => {
    const openGit = ({ serverId }) => setServerId(serverId);
    app.on("serverOverviewOpenGit", openGit);
    return () => app.off("serverOverviewOpenGit", openGit);
  }, []);

  if (model.layout) return <GitPanelLayout model={model} path={path} />;

  if (model.item?.length)
    return (
      <Wrapper
        renderAs="div"
        className={[
          model.className,
          serverId === view.id &&
            "[&_.server-overview-row>.pointer]:bg-slate-700/70 [&_.server-overview-row]:border-slate-600",
        ]}
      >
        <ContentTypeRender path={path} items={model.item} />
      </Wrapper>
    );

  return (
    <Wrapper className={model.className}>
      {serverId && <ContentTypeView key={serverId} contentType="server" format="git" id={serverId} noForm />}
    </Wrapper>
  );
};

export default StyleGitPanel;
