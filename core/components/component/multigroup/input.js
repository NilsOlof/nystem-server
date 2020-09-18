import React, { useState } from "react";
import app from "nystem";
import {
  Panel,
  MultigroupOneInput,
  Button,
  BootstrapPanelToggle,
  Wrapper,
} from "nystem-components";

const MultigroupInput = ({ value, setValue, model, path, view }) => {
  const [ids, setIds] = useState({});
  value = value || [];

  const addItem = () => {
    value.push({});
    setValue(value);
  };

  const createItem = function (item, index) {
    const id = ids[index] || app().utils.uuid();
    if (!ids[index]) setIds({ ...ids, [index]: id });

    return React.createElement(MultigroupOneInput, {
      key: id,
      model,
      value,
      setValue,
      expanded: model.itemExpanded,
      last: index === value.length - 1,
      view,
      path: `${path}.${index}`,
    });
  };

  return (
    <Panel
      type="default"
      expandable={model.expandable}
      expanded={model.expanded}
      icon={model.expandable}
      header={
        <Wrapper className="flex items-center">
          <BootstrapPanelToggle
            model={{ ...model, icon: true, className: "flex items-center" }}
          >
            {model.text}
          </BootstrapPanelToggle>
          <Button
            onClick={addItem}
            type="primary"
            size="xs"
            className="ml-auto"
          >
            Add
          </Button>
        </Wrapper>
      }
      body={value.map(createItem)}
    />
  );
};
export default MultigroupInput;
