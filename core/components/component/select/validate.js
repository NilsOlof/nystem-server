module.exports = ({ value, model }) => {
  value = value || [];
  if (!(value instanceof Array)) value = [value];

  return (
    model.mandatory &&
    !value.length &&
    (model.text_mandatory || "Field is mandatory")
  );
};
