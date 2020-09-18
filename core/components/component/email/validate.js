module.exports = ({ value, model }) => {
  if (model.mandatory && !value) return model.text_mandatory;
  if (!value) return false;
  if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,6}$/im.test(value))
    return "Incorrect e-mail adress";
  return false;
};
