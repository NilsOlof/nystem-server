import { ContentTypeView, useUser } from "nystem-components";

const SessionUser = ({ view, model, ...rest }) => {
  const { contentType, toFormat } = model || rest;
  const user = useUser();

  if (user)
    return (
      <ContentTypeView
        contentType={contentType}
        format={toFormat}
        baseView={view}
        id={user._id}
      />
    );

  return null;
};
export default SessionUser;
