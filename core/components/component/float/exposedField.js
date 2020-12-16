import React from "react";
import {
  InputWrapper,
  FloatInput,
  UseSearch,
  RouterUseQueryStore,
} from "nystem-components";

const FloatExposedField = ({ model, view }) => {
  const [from, setFrom] = RouterUseQueryStore(model.saveIdFrom, "float");
  const [to, setTo] = RouterUseQueryStore(model.saveIdTo, "float");

  UseSearch({ view, id: model.id, value: from && `>${from}` });
  UseSearch({ view, id: model.id, value: to && `<${to}` });

  const base = {
    clearButton: true,
    classNameInput: ["w-16"],
    nolabel: true,
    id: "1",
  };
  const modelFrom = { ...base, text: "From" };
  const modelTo = { ...base, text: "To" };

  return (
    <InputWrapper model={model}>
      <div className="flex items-center">
        <FloatInput model={modelFrom} value={from} setValue={setFrom} />-
        <FloatInput model={modelTo} value={to} setValue={setTo} />
      </div>
    </InputWrapper>
  );
};

export default FloatExposedField;
