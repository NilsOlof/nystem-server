import React, { useMemo, useEffect } from "react";
import { InputWrapper, UseValidator, Button, Wrapper } from "nystem-components";
import validate from "./validate";

const normalizeOption = ({ option }) =>
  !option
    ? []
    : option.map((item) =>
        typeof item === "string"
          ? {
              _id: item,
              text: item,
            }
          : item
      );

const renderButton = ({ option, handleChange, value }) => (
  <Wrapper>
    {option.map(({ text, _id }) => (
      <Button
        onClick={() => handleChange(_id)}
        className="mr-2 my-1"
        key={_id}
        type={value.indexOf(_id) !== -1 ? "primary" : "secondary"}
        size="xs"
      >
        {text}
      </Button>
    ))}
  </Wrapper>
);

const renderCheckbox = ({ option, handleChange, value, limit, inline }) => (
  <Wrapper className="flex flex-wrap items-center">
    {option.map(({ text, _id }) => (
      <span className={`px-2 my-1 checkbox ${inline}`} key={_id}>
        <label>
          <input
            onChange={() => handleChange(_id)}
            type={limit === 1 ? "radio" : "checkbox"}
            checked={value.indexOf(_id) !== -1 ? "checked" : false}
            className="p-1 mr-2"
          />
          {text}
        </label>
      </span>
    ))}
  </Wrapper>
);

const renderDropdown = ({ option, handleChange, value, placeholder }) => (
  // eslint-disable-next-line jsx-a11y/no-onchange
  <select
    className="sm:w-1/2 w-full p-2 border"
    onChange={(e) => handleChange(e.target.value)}
    value={value[0]}
  >
    <option key="_empty" value="">
      {placeholder || " - choose - "}
    </option>
    {option.map(({ text, _id }) => (
      <option key={_id || "___"} value={_id || "___"}>
        {text}
      </option>
    ))}
  </select>
);

const renderTypes = {
  dropdown: renderDropdown,
  button: renderButton,
  checkbox: renderCheckbox,
};

const SelectInput = ({ model, value, view, setValue }) => {
  const [error, setValidated] = UseValidator({ view, validate, value, model });

  const { placeholder, inline, render } = model;

  const limit = render === "dropdown" ? 1 : parseInt(model.limit, 10);
  if (!value) value = [];
  if (!(value instanceof Array)) value = [value];

  const option = useMemo(() => normalizeOption(model), [model]);

  const handleChange = (id) => {
    if (id === "") id = undefined;
    if (value.indexOf(id) !== -1) value.splice(value.indexOf(id), 1);
    else value.push(id);

    if (limit && limit < value.length) value.shift();

    if (limit === 1) setValue(value[0]);
    else setValue(value);
    setValidated(true);
  };
  useEffect(() => {
    if (value.length === 0 && model.default) handleChange(model.default);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const out = renderTypes[render || "checkbox"]({
    option,
    handleChange,
    value,
    limit,
    inline,
    placeholder,
  });

  return model.noWrapper ? (
    out
  ) : (
    <InputWrapper model={model} error={error}>
      {out}
    </InputWrapper>
  );
};
export default SelectInput;
