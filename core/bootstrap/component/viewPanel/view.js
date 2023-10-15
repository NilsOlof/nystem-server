import { Panel, Wrapper, ContentTypeRender } from "nystem-components";

const ViewPanelView = ({ model, path }) => {
  const {
    onClickExpand,
    classNameHead,
    item,
    header,
    typeClass,
    ...panelProps
  } = model;

  return (
    <Panel {...panelProps} type={typeClass}>
      <Wrapper
        renderAs="h3"
        onClickExpand={onClickExpand}
        className={classNameHead}
      >
        <ContentTypeRender path={path} items={header || []} />
      </Wrapper>
      <ContentTypeRender path={path} items={item || []} />
    </Panel>
  );
};
export default ViewPanelView;
