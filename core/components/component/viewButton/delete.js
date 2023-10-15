import { useState } from "react";
import app from "nystem";
import { Button } from "nystem-components";

const ViewButtonDelete = ({ view, model }) => {
  const { className, size, btnType, deletedText } = model;
  const [text, setText] = useState(model.text);

  const handleDelete = (event) => {
    if (model.stopPropagation) event.stopPropagation();

    if (view.event("delete"))
      app()
        .database[view.contentType].delete({ id: view.value._id })
        .then(() =>
          model.redirectURL
            ? window.history.replaceState({}, "", model.redirectURL)
            : setText(deletedText)
        );
  };

  return (
    <Button
      className={className}
      size={size}
      onMouseDown={(event) => {
        if (model.stopPropagation) event.stopPropagation();
      }}
      onClick={handleDelete}
      type={btnType}
    >
      {app().t(text || "Delete")}
    </Button>
  );
};

export default ViewButtonDelete;
