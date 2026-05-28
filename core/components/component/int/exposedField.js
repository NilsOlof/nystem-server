import {
  InputWrapper,
  IntInput,
  Wrapper,
  useSearch,
  useRouterQueryStore,
} from "nystem-components";

const IntExposedField = ({ model, view }) => {
  const [from, setFrom] = useRouterQueryStore(model.saveIdFrom, "int");
  const [to, setTo] = useRouterQueryStore(model.saveIdTo, "int");
  useSearch({
    view,
    id: model.id,
    value: from && `>${from}`,
    noListen: true,
  });
  useSearch({ view, id: model.id, value: to && `<${to}`, noListen: true });

  const modelFrom = {
    id: "from",
    placeholder: "From",
    clearButton: true,
  };
  const modelTo = {
    id: "to",
    placeholder: "To",
    clearButton: true,
  };
  const style = {
    width: "100px",
  };
  return (
    <InputWrapper model={model}>
      <Wrapper className="flex">
        <IntInput
          style={style}
          model={modelFrom}
          value={from}
          setValue={setFrom}
        />
        {" - "}
        <IntInput style={style} model={modelTo} value={to} setValue={setTo} />
      </Wrapper>
    </InputWrapper>
  );
};

export default IntExposedField;
