module.exports = ({ value, model }) => {
  if (model.mandatory && !value) return model.text_mandatory;
  if (!value) return false;
  if (
    !/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/im.test(
      value
    )
  )
    return "Incorrect e-mail adress";
  return false;
};
