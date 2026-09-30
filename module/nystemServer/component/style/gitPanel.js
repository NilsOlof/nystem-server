import React, { useEffect, useState } from "react";
import { Wrapper, ContentTypeView } from "nystem-components";
import app from "nystem";

const StyleGitPanel = ({ model }) => {
  const [serverId, setServerId] = useState(null);

  useEffect(() => {
    const openGit = ({ serverId }) => setServerId(serverId);
    app.on("serverOverviewOpenGit", openGit);
    return () => app.off("serverOverviewOpenGit", openGit);
  }, []);

  return (
    <Wrapper className={model.className}>
      {serverId && (
        <ContentTypeView key={serverId} contentType="server" format="git" id={serverId} noForm />
      )}
    </Wrapper>
  );
};

export default StyleGitPanel;
