// eslint-disable-next-line camelcase
const text_mandatory = "Field is mandatory";

export default ({ value, model }) =>
  // eslint-disable-next-line camelcase
  model.mandatory && !value && (model.text_mandatory || text_mandatory);
