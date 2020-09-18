import React, { useEffect, useState, useContext, createRef } from "react";
import { TextInput, DatabaseSearchContext } from "nystem-components";
import { useHistory } from "react-router-dom";
import app from "nystem";

/*
const useStateStore = (active) => {
  const ref = createRef();
  const [value, setValue] = useState(active ? false : "");

  useEffect(() => {
    const oldValue = app().stateStore.get(ref.current);
    if (value !== false && value !== oldValue)
      app().stateStore.set(ref.current, value);
  }, [ref, value]);

  useEffect(() => {
    if (value !== false) return;
    setValue(app().stateStore.get(ref.current) || "");
  }, [ref, value]);

  return [value, setValue, ref];
};
*/

const useQueryStore = (active) => {
  const history = useHistory();

  const ref = createRef();
  const { search } = history.location;
  const [value, setValue] = useState(
    active && search ? search.substring(1) : ""
  );

  const setRouterValue = (value) => {
    setValue(value);

    if (!active) return;

    const { pathname } = history.location;
    history.replace(`${pathname}?${value}`);
  };

  return [value, setRouterValue, ref];
};

const TextExposedField = ({ model }) => {
  const [id] = useState(app().uuid());
  const [className, setClassName] = useState("");
  const [value, setValue, ref] = useQueryStore(model.saveValue);
  const [timer, setTimer] = useState(false);
  const { setFilter } = useContext(DatabaseSearchContext);

  useEffect(
    () => () => {
      if (timer) clearTimeout(timer);
    },
    [timer]
  );

  useEffect(() => {
    setClassName("border-orange-300 outline-none");
    setFilter({ id, modelId: model.id, value }).then(() => {
      setClassName("border-green-500 outline-none");
      clearTimeout(timer);
      setTimer(setTimeout(() => setClassName(""), 1000));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setFilter, value]);

  return (
    <TextInput
      ref={ref}
      model={{
        ...model,
        clearButton: true,
        inputClassName: ["w-full", className, ...(model.classNameInput || [])],
        selectAllOnFocus: true,
      }}
      value={value}
      setValue={setValue}
    />
  );
};

export default TextExposedField;
