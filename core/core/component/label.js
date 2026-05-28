const Label = ({ model }) => {
  if (!model.text) return null;
  if (model.mandatory)
    return (
      <label htmlFor="id_input" className="col-sm-2 col-form-label">
        {model.text}
        <span className="red">*</span>
      </label>
    );
  return (
    <label htmlFor="id_input" className="col-sm-2 col-form-label">
      {model.text}
    </label>
  );
};
export default Label;
