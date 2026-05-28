import app from "nystem";
import { Button, ContentTypeRender } from "nystem-components";

const StyleButton = ({ model, path }) => (
  <Button className={model.className} type={model.btnType} size={model.size}>
    <ContentTypeRender path={path} items={model.item} />
  </Button>
);

export default StyleButton;
