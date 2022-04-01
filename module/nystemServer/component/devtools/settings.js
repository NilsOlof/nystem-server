import { useEffect } from "react";
import app from "nystem";

const DevtoolsSettings = ({ view }) => {
  useEffect(() => {
    const init = async () => {
      const { data: settings } = await app().event("devtools", {
        path: `settings`,
      });
      const { data: vContentTypes } = await app().event("devtools", {
        path: `populatedViews`,
      });
      const { data: user } = await app().event("devtools", {
        path: `session.user`,
      });

      view.setValue({ value: { settings, user, vContentTypes } });
    };
    init();
  }, [view]);

  return null;
};

export default DevtoolsSettings;
