import React, { useState, useEffect, useRef } from "react";
import app from "nystem";
import {
  InputWrapper,
  ReferenceView,
  Wrapper,
  ReferenceSortable,
  Button,
  ViewInViewView,
  UseValidator,
  Input,
} from "nystem-components";
import validate from "./validate";
import "./input.css";

const useSearch = ({ contentType, searchVal, model } = {}) => {
  const [result, setResult] = useState([]);
  useEffect(() => {
    if (!contentType) return;
    const { sortby, searchCount, reverse } = model;

    const db = app().database[contentType];
    db.search({
      filter: searchVal && { $all: searchVal },
      count: searchCount || 100,
      data: undefined,
      sortby,
      reverse,
    }).then(({ data }) => setResult(data || []));
  }, [setResult, contentType, searchVal, model]);

  return { result };
};

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
      className={className || "sm:w-1/2 w-full"}
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

const InlineAdd = ({ model, view }) => {
  const [isAdding, setIsAdding] = useState(false);
  if (!model.inlineAdd) return null;
  if (!isAdding)
    return (
      <Button
        onClick={() => setIsAdding(true)}
        size="sm"
        className="mb-1 float-right"
      >
        Create new
      </Button>
    );
  return (
    <ViewInViewView
      model={{ contentType: model.source, view: model.inlineAdd }}
      onSave={({ _id }) => {
        view.event("referenceAdd", { model, value: { _id }, close: true });
        setIsAdding(false);
      }}
    />
  );
};

const ReferenceInput = ({ model, view, value = [], setValue, path }) => {
  const { source, exposed } = model;
  const [inFocus, setInFocus] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [error] = UseValidator({ view, validate, value, model });

  const { result } = useSearch({ contentType: source, searchVal, model }) || {};

  value = value instanceof Array ? value : [value];

  useEffect(() => {
    const events = exposed
      ? { add: "exposedReferenceAdd", remove: "exposedReferenceRemove" }
      : { add: "referenceAdd", remove: "referenceRemove" };

    const add = ({ value: addValue, close, path: atPath }) => {
      if (path !== atPath) return;

      const newVal = [...value, addValue._id];
      setValue(model.limit === 1 ? newVal[0] : newVal);

      const addable = !model.limit || newVal.length < model.limit;
      if (!close) setInFocus(addable);

      setSearchVal("");
    };
    const remove = ({ value: removeValue, path: atPath }) => {
      if (path !== atPath) return;

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
  const itemsSelect =
    result.map((item) => item._id).filter((id) => !value.includes(id)) || [];

  const addable = !model.limit || value.length < model.limit || null;

  return (
    <InputWrapper
      model={{ ...model, classNameInput: "relative flex-grow" }}
      error={error}
    >
      {(value.length || null) && (
        <Wrapper className="px-1 pb-2 pt-1 w-full max-w-sm">
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
          <InlineAdd model={model} view={view} />
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
          className="absolute shadow-md sm:w-1/2 w-full overflow-y-auto z-10 max-h-400"
          onMouseDown={() => {
            clicked = true;
            setInFocus(true);
            setTimeout(() => {
              clicked = false;
            }, 500);
          }}
        >
          {itemsSelect.length ? (
            <ReferenceView
              model={{ ...model, renderFormat: model.renderFormatSelect }}
              value={itemsSelect}
              view={view}
              path={path}
            />
          ) : (
            <Wrapper className="p-2 bg-red-200">No addable items found</Wrapper>
          )}
        </Wrapper>
      )}
    </InputWrapper>
  );
};
export default ReferenceInput;
