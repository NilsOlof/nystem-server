import React from "react";
import {
  Panel,
  ContentTypeRender,
  BootstrapPanelToggle,
  Button,
  Wrapper,
} from "nystem-components";

const MultigroupOneInput = ({ value, model, view, path, setValue }) => {
  let text = view.getValue(`${path}.${model.field || "text"}`);

  if (text instanceof Array) text = text.join(" ");

  const onClose = (id) => {
    value.splice(id, 1);
    setValue(value);
  };

  if (model.info && value[model.info]) text += ` (${value[model.info]})`;

  return (
    <Panel
      type="default"
      expanded={model.itemExpanded}
      expandable={model.itemExpandable}
      icon={model.itemExpandable}
      header={
        <Wrapper className="flex items-center">
          <BootstrapPanelToggle
            model={{
              ...model,
              item: undefined,
              icon: true,
              className: "flex items-center",
            }}
          >
            {text || "Item"}
          </BootstrapPanelToggle>
          <Button
            onClick={onClose}
            type="primary"
            className="ml-auto"
            size="xs"
          >
            Remove
          </Button>
        </Wrapper>
      }
      body={<ContentTypeRender path={path} items={model.item} />}
    />
  );
};
export default MultigroupOneInput;
