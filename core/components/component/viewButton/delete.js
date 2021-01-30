import React, { useState } from "react";
import app from "nystem";
import { Button } from "nystem-components";
import { withRouter } from "react-router";

const ViewButtonDelete = ({ view, model, history }) => {
  const { className, size, btnType, deletedText } = model;
  const [text, setText] = useState(model.text);

  const handleDelete = () => {
    if (view.event("delete"))
      app()
        .database[view.contentType].delete({ id: view.value._id })
        .then(() =>
          model.redirectURL
            ? history.replace(model.redirectURL)
            : setText(deletedText)
        );
  };

  return (
    <Button
      className={className}
      size={size}
      onClick={handleDelete}
      type={btnType}
    >
      {app().t(text || "Delete")}
    </Button>
  );
};

export default withRouter(ViewButtonDelete);
