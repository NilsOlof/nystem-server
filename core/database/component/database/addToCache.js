import { useEffect } from "react";
import app from "nystem";

const DatabaseAddToCache = ({ options = {}, contentType, addMedia }) => {
  useEffect(() => {
    const doSearch = () => {
      if (options.count) options.count = parseInt(options.count, 10);

      app()
        .database[contentType].search(options)
        .then(({ data }) => {
          if (!data) return;

          data.forEach((item) =>
            app().event("addToCache", {
              id: item._id,
              contentType,
              addReferencesToCache: options.addReferencesToCache,
              addMedia,
              value: item,
            })
          );
        });
    };

    let timer = false;
    const doSearchDebounce = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        timer = false;
        doSearch();
      }, 5000);
    };

    app().database[contentType].on("update", -1000, doSearchDebounce);
    app().on(["login", "logout"], -1000, doSearchDebounce);

    return () => {
      if (timer) clearTimeout(timer);

      app().database[contentType].off("update", doSearchDebounce);
      app().off(["login", "logout"], doSearchDebounce);
    };
  });

  return null;
};
export default DatabaseAddToCache;
