import React, { useState } from "react";
import { Button, Wrapper, UseSearch } from "nystem-components";

const BooleanExposedField = ({ model, view }) => {
  const [value, setValue] = useState(undefined);
  const { className, text } = model;
  UseSearch({ view, id: model.id, value });

  const options = [
    {
      _id: "true",
      text: "True",
    },
    {
      _id: "false",
      text: "False",
    },
  ];

  const option = (item) => {
    if (value === item._id)
      return (
        <Button
          onClick={() => setValue(item._id)}
          type="primary"
          key={item._id}
          value={item._id}
        >
          {item.text}
        </Button>
      );

    return (
      <Button
        onClick={() => setValue(item._id)}
        type="secondary"
        key={item._id}
        value={item._id}
      >
        {item.text}
      </Button>
    );
  };

  return (
    <Wrapper className={className}>
      <Wrapper className="mr-2">{text}</Wrapper>
      {options.map(option)}
    </Wrapper>
  );
};

export default BooleanExposedField;
