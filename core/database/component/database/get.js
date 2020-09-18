import { useEffect, useState } from "react";
import app from "nystem";

const DatabaseGet = ({ id, contentType, noAutoUpdate }) => {
  const db = app().database[contentType];
  const [result, setResult] = useState(false);

  useEffect(() => {
    if (!id) {
      setResult(false);
      return;
    }
    if (!db) {
      console.error({ id, contentType, noAutoUpdate });
      return;
    }

    let first = true;

    const doGet = ({ ids } = {}) => {
      if (!ids || ids.includes(id))
        db.get({ id }).then((result) => {
          setResult({ first, ...result });
          first = false;
        });
    };
    doGet();
    if (noAutoUpdate) return;

    db.on("update", doGet);
    return () => {
      db.off("update", doGet);
    };
  }, [noAutoUpdate, contentType, db, id]);

  return { loading: id && !result, ...result };
};
export default DatabaseGet;
