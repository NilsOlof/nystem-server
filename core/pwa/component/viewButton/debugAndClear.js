import app from "nystem";
import { ContentTypeRender, Wrapper, useEvent } from "nystem-components";

const ViewButtonDebugAndClear = ({ model, path }) => {
  const { appVersion } = useEvent("getAppVersion");

  if (model.viewActionType === "appVersion")
    return <Wrapper className={model.className}>{appVersion}</Wrapper>;

  const doByType = {
    clearAndReload: () => app.event("clearCacheAndReload"),
    reload: () => window.reload(),
  };

  return (
    <Wrapper onClick={doByType[model.viewActionType]}>
      <ContentTypeRender path={path} items={model.item} />
    </Wrapper>
  );
};

export default ViewButtonDebugAndClear;
