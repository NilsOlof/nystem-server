import React, { useState, useEffect, useRef } from "react";
import {
  InputWrapper,
  Wrapper,
  ReferenceSortable,
  Button,
  ViewInViewView,
  UseValidator,
  Input,
  ContentTypeView,
} from "nystem-components";
import validate from "./validate";
import "./input.css";

const InputSpes = ({ focus, onBlur, onFocus, ...props }) => {
  const inputEl = useRef(null);
  const [inFocus, setInFocus] = useState(false);
  useEffect(() => {
    if (!focus || inFocus) return;
    inputEl.current.focus();
  }, [focus, inFocus, onBlur]);

  let { className } = props;
  className = className instanceof Array ? className.join(" ") : className;

  return (
    <Input
      ref={inputEl}
      {...props}
      className={className || "w-full"}
      onChange={props.onChange}
      onFocus={() => {
        setInFocus(true);
        if (onFocus) onFocus();
      }}
      onBlur={() => {
        setInFocus(false);
        onBlur();
      }}
    />
  );
};

const InlineAdd = ({ model, view, path }) => {
  const [isAdding, setIsAdding] = useState(false);
  if (!model.inlineAdd) return null;
  if (!isAdding)
    return (
      <Button
        onClick={() => setIsAdding(true)}
        size="sm"
        className="float-right mb-1"
      >
        Create new
      </Button>
    );
  return (
    <ViewInViewView
      model={{
        contentType: model.source,
        view: model.inlineAdd,
        className: model.classNameInput,
      }}
      onSave={({ _id }) => {
        view.event("referenceAdd", {
          model,
          path,
          value: { _id },
          close: true,
        });
        setIsAdding(false);
      }}
    />
  );
};

const ReferenceInput = ({ model, view, value = [], setValue, path }) => {
  const { exposed } = model;
  const [inFocus, setInFocus] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [error] = UseValidator({ view, validate, value, model });

  if (!value) value = [];
  value = value instanceof Array ? value : [value];

  useEffect(() => {
    const modelId = model.id;
    const events = exposed
      ? { add: "exposedReferenceAdd", remove: "exposedReferenceRemove" }
      : { add: "referenceAdd", remove: "referenceRemove" };

    const add = ({ model, value: addValue, close, path: atPath }) => {
      if (path !== atPath || modelId !== model.id) return;

      const newVal = [...value, addValue._id];
      setValue(model.limit === 1 ? newVal[0] : newVal);

      const addable = !model.limit || newVal.length < model.limit;
      if (!close) setInFocus(addable);

      setSearchVal("");
    };
    const remove = ({ model, value: removeValue, path: atPath }) => {
      if (path !== atPath || modelId !== model.id) return;

      const newVal = value.filter((id) => `${id}` !== `${removeValue._id}`);
      setValue(newVal.length ? newVal : undefined);
      setInFocus(true);
    };
    view.on(events.add, add);
    view.on(events.remove, remove);
    return () => {
      view.off(events.add, add);
      view.off(events.remove, remove);
    };
  }, [view, setValue, value, setInFocus, model.id, model.limit, path, exposed]);

  let clicked = false;

  const addable = !model.limit || value.length < model.limit || null;

  return (
    <InputWrapper
      model={{ ...model, classNameInput: "relative flex-grow" }}
      error={error}
    >
      {(value.length || null) && (
        <Wrapper className="w-full max-w-sm px-1 pb-2 pt-1">
          <ReferenceSortable
            model={model}
            view={view}
            value={value}
            setValue={setValue}
            path={path}
          />
        </Wrapper>
      )}
      {addable && (
        <>
          <InlineAdd model={model} view={view} path={path} />
          <InputSpes
            onFocus={() => setInFocus(true)}
            onBlur={() => {
              if (!clicked) setInFocus(false);
            }}
            onChange={(value) => setSearchVal(value)}
            value={searchVal}
            placeholder="Search and add existing"
            focus={inFocus}
          />
        </>
      )}
      {addable && inFocus && (
        <Wrapper
          className="max-h-400 absolute z-10 w-full overflow-y-auto border border-gray-500 shadow-md sm:w-1/2"
          onMouseDown={() => {
            clicked = true;
            setInFocus(true);
            setTimeout(() => {
              clicked = false;
            }, 500);
          }}
        >
          <ContentTypeView
            contentType={model.source}
            baseView={view}
            format={model.renderFormatSelect}
            onReference={(item) =>
              view.event(item.event, { ...item, model, path })
            }
            value={{ exclude: value, searchVal }}
          />
        </Wrapper>
      )}
    </InputWrapper>
  );
};
export default ReferenceInput;
