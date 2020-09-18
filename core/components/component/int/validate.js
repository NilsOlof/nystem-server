module.exports = ({ value, model }) =>
  model.mandatory && !value && model.text_mandatory;
