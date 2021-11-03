import React, { useRef, useMemo, useEffect, useState } from "react";
import app from "nystem";
import {
  InputWrapper,
  UseValidator,
  Button,
  Wrapper,
  Select,
} from "nystem-components";
import validate from "./validate";

const normalizeOption = ({ option, optionObj }) =>
  !option
    ? optionObj || []
    : option.map((item) =>
        typeof item === "string" || typeof item === "number"
          ? {
              _id: item,
              text: item,
            }
          : item
      );

const RenderButton = ({ option, handleChange, value, model }) => (
  <Wrapper className={model.classNameInput}>
    {option.map(({ text, _id }) => (
      <Button
        onClick={() => handleChange(_id)}
        className={[model.classNameItem, "mr-2 my-1"]}
        key={_id}
        type={value.indexOf(_id) !== -1 ? "primary" : "secondary"}
        size="xs"
      >
        {text}
      </Button>
    ))}
  </Wrapper>
);

const RenderCheckbox = ({
  model,
  option,
  handleChange,
  value,
  limit,
  inline,
}) => {
  const ref = useRef();
  useEffect(() => {
    if (!ref.current || !model.focus) return;
    ref.current.focus();
  }, [model.focus, option.length]);

  return (
    <Wrapper className={inline && "flex flex-wrap items-center"}>
      {option.map(({ text, _id }, index) => (
        <Wrapper className={["px-2", "my-1"]} key={_id}>
          <label>
            <input
              ref={index === 0 ? ref : undefined}
              onChange={() => handleChange(_id)}
              type={limit === 1 ? "radio" : "checkbox"}
              checked={value.indexOf(_id) !== -1 ? "checked" : false}
              className="p-1 mr-2"
            />
            {text}
          </label>
        </Wrapper>
      ))}
    </Wrapper>
  );
};

const RenderDropdown = ({
  option,
  handleChange,
  value,
  placeholder,
  model,
}) => (
  // eslint-disable-next-line jsx-a11y/no-onchange
  <Select
    className={model.classNameInput || "sm:w-1/2 w-full p-2 border"}
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
  </Select>
);

const renderTypes = {
  dropdown: RenderDropdown,
  button: RenderButton,
  checkbox: RenderCheckbox,
};

const SelectInput = ({ model, value, view, setValue }) => {
  const [id] = useState(app().uuid);
  const [error, setValidated] = UseValidator({ view, validate, value, model });

  useEffect(() => {
    if (!view || view.value._id || value.length || !model.default) return;

    setTimeout(() => {
      setValue(model.default);
    }, 0);
  }, [view, value, model, setValue]);

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

  return (
    <InputWrapper id={id} model={model} error={error}>
      {renderTypes[render || "checkbox"]({
        option,
        handleChange,
        value,
        limit,
        inline,
        placeholder,
        model,
        id,
      })}
    </InputWrapper>
  );
};
export default SelectInput;
