import React, { useState, useEffect, useRef } from "react";
import { DateInput } from "nystem-components";

const DateExposedField = ({ model, view, wrapper }) => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [className, setClassName] = useState("");

  const updateCounter = useRef(0);
  const delayTimer = useRef(null);

  // Sync state with the search engine
  const update = () => {
    const modelId = model.id;
    const filter = view.searchProp.filter;

    const fromRaw = filter.get(`${modelId}_from`);
    const toRaw = filter.get(`${modelId}_to`);

    const fromVal =
      fromRaw && fromRaw[modelId] ? fromRaw[modelId].substring(1) : "";
    const toVal = toRaw && toRaw[modelId] ? toRaw[modelId].substring(1) : "";

    setFrom(fromVal);
    setTo(toVal);

    if (updateCounter.current === 0) {
      setClassName("has-success");
      setTimeout(() => setClassName(""), 1000);
    } else {
      updateCounter.current--;
    }
  };

  useEffect(() => {
    view.searchProp.onUpdate(update);
    return () => {
      view.searchProp.offUpdate(update);
      clearTimeout(delayTimer.current);
    };
  }, [view.searchProp]);

  const handleSearch = (id, value) => {
    clearTimeout(delayTimer.current);

    // UI Feedback
    setClassName("has-warning");
    if (id === "from") setFrom(value);
    else setTo(value);

    delayTimer.current = setTimeout(() => {
      updateCounter.current++;
      const formattedValue = value
        ? id === "to"
          ? `<${value}`
          : `>${value}`
        : "";

      view.searchProp.filter.add(model.id, formattedValue, `${model.id}_${id}`);
    }, 200);
  };

  const containerClass =
    model.className && !wrapper ? model.className.join(" ") : "";
  const style = { width: "150px" };

  return (
    <div className={`${containerClass} ${className} form-inline`}>
      {model.text}
      <DateInput
        style={style}
        model={{ id: "from", placeholder: "From", clearButton: true }}
        value={from}
        setValue={(val) => handleSearch("from", val)}
      />
      {" - "}
      <DateInput
        style={style}
        model={{ id: "to", placeholder: "To", clearButton: true }}
        value={to}
        setValue={(val) => handleSearch("to", val)}
      />
    </div>
  );
};

export default DateExposedField;
