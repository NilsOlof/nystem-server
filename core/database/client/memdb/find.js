module.exports = app => {
  app.database.on("init", ({ collection, db }) => {
    collection.on("find", 1000, query => {
      const { field, value, data, testIfSet } = query;
      if (data) return;
      const { dbArray } = db;

      if (!testIfSet) {
        for (let i = 0; i < dbArray.length; i++)
          if (dbArray[i][field] === value)
            return { ...query, data: dbArray[i] };
        return query;
      }

      for (let i = 0; i < dbArray.length; i++)
        if (!dbArray[i][field] === !value)
          return { ...query, data: dbArray[i] };
    });
  });
};
