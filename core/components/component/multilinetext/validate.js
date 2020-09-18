const text_mandatory = "Field is mandatory";

module.exports = ({ value, model }) =>
  model.mandatory &&
  !value &&
  !value.length &&
  (model.text_mandatory || text_mandatory);
