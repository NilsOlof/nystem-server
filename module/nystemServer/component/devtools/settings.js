import { useEffect } from "react";
import app from "nystem";

const DevtoolsSettings = ({ view }) => {
  useEffect(() => {
    app()
      .event("devtools", { path: `settings` })
      .then(({ data }) => {
        view.setValue({ path: "settings", value: data });
      });

    app()
      .event("devtools", { path: `populatedViews` })
      .then(({ data }) => {
        view.setValue({ path: "populatedViews", value: data });
      });

    app()
      .event("devtools", { path: `session.user` })
      .then(({ data }) => {
        view.setValue({ path: "session", value: data });
      });
  }, [view]);

  return null;
};

export default DevtoolsSettings;
