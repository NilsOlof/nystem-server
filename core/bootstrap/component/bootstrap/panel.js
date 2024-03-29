import { Panel, ContentTypeRender } from "nystem-components";

const BootstrapPanel = ({ model, path }) => {
  const { item, header, typeClass } = model;

  return (
    <Panel
      {...model}
      type={typeClass}
      header={<ContentTypeRender path={path} items={header} />}
      body={<ContentTypeRender path={path} items={item} />}
    />
  );
};
export default BootstrapPanel;
