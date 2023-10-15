import app from "nystem";
import { Button, Wrapper, ContentTypeRender } from "nystem-components";

const ViewButtonReference = ({ model, view, path }) => {
  const { event, item, className } = model;
  const callView = event.includes("Add") ? view.baseView : view;

  if (item && item.length)
    return (
      <Wrapper
        className={className}
        onClick={() =>
          callView.event("reference", {
            event,
            value: view.value,
            viewId: view.id,
          })
        }
      >
        <ContentTypeRender path={path} items={item} />
      </Wrapper>
    );

  return (
    <Button
      onClick={() =>
        callView.event("reference", {
          event,
          value: view.value,
          viewId: view.id,
        })
      }
      className={className}
      type={model.btnType}
      size={model.btnSize}
    >
      {app().t(model.text)}
    </Button>
  );
};

export default ViewButtonReference;
