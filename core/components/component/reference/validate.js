module.exports = ({ value, model }) =>
  model.mandatory &&
  (!value || (value instanceof Array && !value[0])) &&
  (model.text_mandatory || "Field is mandatory");
