import React, { useState, useEffect, useRef } from "react";

const MatrixInputlist = ({ value: propValue = [], limit, setValue }) => {
  // Normalize initial value
  const normalizeValue = (val) => {
    if (!Array.isArray(val)) val = [val];
    return val.length > limit ? [...val] : [...val, ""];
  };

  const [value, setLocalValue] = useState(normalizeValue(propValue));

  const inputValueRefs = useRef([]);

  // Sync with props (replacement for UNSAFE_componentWillReceiveProps)
  useEffect(() => {
    let val = propValue;
    if (typeof propValue === "string") val = [propValue];
    setLocalValue([...val, ""]);
  }, [propValue]);

  const handleChange = () => {
    const val = inputValueRefs.current
      .map((input) => input?.value)
      .filter((v) => v);

    if (setValue) setValue(val);

    setLocalValue(val.length > limit ? [...val, ""] : [...val]);
  };

  const inputKeyField = (item, index) => (
    <input
      key={`key-${index}`}
      className="form-control"
      value={item}
      onChange={() => {}}
      type="text"
    />
  );

  const inputValueField = (item, index) => (
    <input
      key={`value-${index}`}
      ref={(el) => (inputValueRefs.current[index] = el)}
      className="form-control"
      value={item}
      onChange={handleChange}
      type="text"
    />
  );

  return (
    <div>
      <div className="col-sm-3">{value.map(inputKeyField)}</div>
      <div className="col-sm-3">{value.map(inputValueField)}</div>
    </div>
  );
};

export default MatrixInputlist;
