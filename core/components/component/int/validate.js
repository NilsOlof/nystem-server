export default ({ value, model }) =>
  model.mandatory && !value && model.text_mandatory;
