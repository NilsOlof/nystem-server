module.exports = ({ value, model }) => {
  if (value === "aa") value = undefined;
  if (!(value instanceof Array)) value = [value, value];

  if (model.mandatory && !value[0]) return model.text_mandatory;
  if (!value[0] && !value[1]) return false;

  if (value[0].length < model.length)
    return `Password must be at least ${model.length} characters`;

  if (value[0] !== value[1]) return "Repeated password must match";

  return false;
};
