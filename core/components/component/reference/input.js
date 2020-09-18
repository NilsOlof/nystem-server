import React, { useState, useEffect, useRef } from "react";
import app from "nystem";
import {
  InputWrapper,
  ReferenceView,
  Wrapper,
  ReferenceSortable,
  Button,
  ViewInViewView,
} from "nystem-components";

const useSearch = ({ contentType, searchVal, sortby } = {}) => {
  const [result, setResult] = useState([]);

  useEffect(() => {
    if (!contentType) return;

    const db = app().database[contentType];
    db.search({
      filter: searchVal && { $all: searchVal },
      count: 100,
      data: undefined,
      sortby,
    }).then(({ data }) => setResult(data || []));
  }, [setResult, contentType, searchVal, sortby]);

  return { result };
};

const Input = ({ selectAllOnFocus, focus, onBlur, onFocus, ...props }) => {
  const inputEl = useRef(null);
  const [inFocus, setInFocus] = useState(false);
  useEffect(() => {
    if (!focus || inFocus) return;
    inputEl.current.focus();
  }, [focus, inFocus, onBlur]);

  let { className } = props;
  className = className instanceof Array ? className.join(" ") : className;

  return (
    <input
      ref={inputEl}
      {...props}
      className={`appearance-none block bg-grey-lighter text-grey-darker border border-grey-lighter rounded py-2 px-3 ${
        className || "sm:w-1/2 w-full"
      }`}
      onChange={(e) => props.onChange(e.target.value)}
      onFocus={(ev) => {
        if (selectAllOnFocus) inputEl.current.select();
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

const ReferenceInput = ({ model, view, value = [], setValue }) => {
  const { source } = model;
  const [inFocus, setInFocus] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const { result } =
    useSearch({ contentType: source, searchVal, sortby: model.sortby }) || {};

  value = value instanceof Array ? value : [value];
  const error = undefined;

  useEffect(() => {
    const add = ({ model: addModel, value: addValue, close }) => {
      if (addModel.id !== model.id) return;

      setValue([...value, addValue._id]);
      if (!close) setInFocus(true);

      setSearchVal("");
    };
    const remove = ({ model: removeModel, value: removeValue }) => {
      if (removeModel.id !== model.id) return;

      setValue(value.filter((id) => id !== removeValue._id));
    };
    view.on("referenceAdd", add);
    view.on("referenceRemove", remove);
    return () => {
      view.off("referenceAdd", add);
      view.off("referenceRemove", remove);
    };
  }, [view, setValue, value, setInFocus, model.id]);

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
          />
        </Wrapper>
      )}
      {addable && (
        <>
          <InlineAdd model={model} view={view} />
          <Input
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
          className="absolute shadow-md sm:w-1/2 w-full bg-white overflow-y-auto z-10 max-h-400"
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
