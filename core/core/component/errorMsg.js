import app from "nystem";

const ErrorMsg = ({ error, type = "danger", className: customClass }) => {
  if (!error) return null;

  const displayError = error === true ? "Required field" : error;
  const classNames = ["alert", `alert-${type}`, customClass]
    .filter(Boolean)
    .join(" ");

  return (
    <p
      className={classNames}
      dangerouslySetInnerHTML={{ __html: app.t(displayError) }}
    />
  );
};

export default ErrorMsg;
