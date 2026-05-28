import { useState, useEffect, useRef } from "react";

const MultilinetextInputlist = ({
  value: propValue = [],
  limit,
  setValue,
  focus,
}) => {
  const normalizeValue = (val) => {
    if (!Array.isArray(val)) val = [val];
    if (limit && val.length > limit) return [...val];
    return [...val, ""];
  };

  const [value, setLocalValue] = useState(normalizeValue(propValue));
  const inputRefs = useRef([]);

  // Sync with props (replaces UNSAFE_componentWillReceiveProps)
  useEffect(() => {
    let val = propValue;
    if (typeof propValue === "string") val = [propValue];

    if (limit && val.length > limit) {
      setLocalValue([...val]);
    } else {
      setLocalValue([...val, ""]);
    }
  }, [propValue, limit]);

  const handleChange = () => {
    const val = inputRefs.current.map((input) => input?.value).filter((v) => v);

    if (setValue) setValue(val);

    if (limit && val.length > limit) {
      setLocalValue([...val]);
    } else {
      setLocalValue([...val, ""]);
    }
  };

  // componentDidMount equivalent (focus last input)
  useEffect(() => {
    if (focus && inputRefs.current.length > 0) {
      const lastIndex = value.length - 1;
      inputRefs.current[lastIndex]?.focus();
    }
  }, [focus, value.length]);

  return (
    <div>
      {value.map((item, index) => (
        <input
          key={`input${index}`}
          ref={(el) => (inputRefs.current[index] = el)}
          className="form-control"
          value={item}
          onChange={handleChange}
          type="text"
        />
      ))}
    </div>
  );
};

export default MultilinetextInputlist;
