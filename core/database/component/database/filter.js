import { useEffect, useRef } from "react";
import { UseSearch, RouterUseQueryStore } from "nystem-components";

const DatabaseFilter = ({ model, view }) => {
  const [value, setValue] = RouterUseQueryStore(model.saveId);
  const firstVal = useRef();
  firstVal.current = firstVal.current || value;
  UseSearch({ view, id: model.field, value, exact: model.exact || undefined });

  const emitterByType = {
    view,
    baseView: view.baseView,
    baseViewBaseView: view.baseView?.baseView,
    baseViewBaseViewBaseView: view.baseView?.baseView?.baseView,
  };
  const emitter = emitterByType[model.eventType || "baseView"];

  useEffect(() => {
    if (!firstVal.current) return;
    setTimeout(() => {
      if (emitter.getValue(model.value) !== firstVal.current)
        emitter.setValue({ path: model.value, value: firstVal.current });
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onChange = () => {
      const val = emitter.getValue(model.value);
      if (value !== val) setValue(emitter.getValue(model.value));
    };

    onChange();
    emitter.on("change", -100, onChange);
    return () => {
      emitter.off("change", onChange);
    };
  }, [emitter, model.value, setValue, value]);

  return null;
};

export default DatabaseFilter;
