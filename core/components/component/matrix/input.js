import React from "react";
import { InputWrapper, Input } from "nystem-components";

const MatrixInput = ({ value, model, setValue }) => {
  const { limit = 0, rowLabel } = model;

  value = value || [];
  if (!limit || value.length < limit) value = [...value, []];

  const handleChange = (atRow, index, newVal) => {
    const len = value.length;
    const val = value.slice(0, atRow === len - 1 ? len : len - 1);

    val[atRow][index] = newVal;

    if (val[len - 2] && !val[len - 2][0]) setValue(val.slice(0, len - 2));
    else setValue(val);
  };

  const mapHeader = (item, index) => <th key={index}>{item}</th>;

  const mapField = (label, atRow, index) => {
    const val = value[atRow][index] ? value[atRow][index] : "";
    return (
      <td key={index}>
        <Input
          placeholder={label}
          className="form-control"
          value={val}
          maxLength={model.length}
          onChange={(val) => handleChange(atRow, index, val)}
          type="text"
        />
      </td>
    );
  };

  const mapRow = (item, rowIndex) => (
    <tr key={rowIndex}>
      {model.rowLabel.map((label, index) => mapField(label, rowIndex, index))}
    </tr>
  );

  return (
    <InputWrapper model={model}>
      <table>
        <thead>
          <tr>{rowLabel.map(mapHeader)}</tr>
        </thead>
        <tbody>{value.map(mapRow)}</tbody>
      </table>
    </InputWrapper>
  );
};
export default MatrixInput;
