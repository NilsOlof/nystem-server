import { useEffect } from "react";

const ViewInViewSetBaseViewValue = ({ model, view }) => {
  useEffect(() => {
    view.setValue({
      path: model.toField,
      value: view.baseView.getValue(model.fromField),
    });
  }, [model, view]);

  return null;
};
export default ViewInViewSetBaseViewValue;
