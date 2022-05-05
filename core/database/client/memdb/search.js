const sortFuncInt = (key, reverse) => {
  const up = reverse ? 1 : -1;
  const down = reverse ? -1 : 1;

  return (a, b) => {
    const x = a[key];
    const y = b[key];

    if (x === undefined) return y === undefined ? 0 : down;
    if (y === undefined) return up;
    return x < y ? up : x > y ? down : 0;
  };
};

const sortFuncText = (key, reverse) => {
  const up = reverse ? 1 : -1;
  const down = reverse ? -1 : 1;

  return (a, b) => {
    let x = a[key];
    let y = b[key];
    if (x === undefined) return y === undefined ? 0 : up;
    if (y === undefined) return down;
    x = x.toString().toLowerCase();
    y = y.toString().toLowerCase();

    return x < y ? up : x > y ? down : 0;
  };
};

const sortFuncCount = (key, reverse) => {
  const up = reverse ? 1 : -1;
  const down = reverse ? -1 : 1;

  return (a, b) => {
    const x = a[key] ? a[key].length : 0;
    const y = b[key] ? b[key].length : 0;

    if (x === undefined) return y === undefined ? 0 : down;
    if (y === undefined) return up;
    return x < y ? up : x > y ? down : 0;
  };
};

const sortByType = {
  int: sortFuncInt,
  date: sortFuncInt,
  reference: sortFuncCount,
  default: sortFuncText,
};

const sortByFunc = (array, sortBys) => {
  const sortFuncs = sortBys.map(({ type, key, reverse }) =>
    sortByType[type]
      ? sortByType[type](key, reverse)
      : sortByType.default(key, reverse)
  );

  return array.sort((a, b) => {
    let res;
    for (let i = 0; i < sortFuncs.length; i++) {
      res = sortFuncs[i](a, b);
      if (res !== 0) return res;
    }
    return res;
  });
};

function field2IdType(contentType) {
  const field2IdType = {};
  contentType.item = contentType.item || [];
  for (let i = 0; i < contentType.item.length; i++) {
    const item = contentType.item[i];
    field2IdType[item.id] = item.extends ? item.extends : item.type;
  }
  field2IdType._crdate = "date";
  return field2IdType;
}

function setSearchDefaults(query, contentType) {
  const items = contentType.item || [];
  query.sortby = !query.sortby
    ? items.find((item) => item.id === "title")
      ? "title"
      : "name"
    : query.sortby;

  query.sortby = query.sortby || "_chdate";
  query.position = query.position || 0;
  query.count = query.count || 200;
}

function getFilterArray(filter) {
  if (filter && Object.keys(filter).length === 0) return [];
  if (filter && filter.$and) {
    filter = { ...filter };
    const tmp = filter.$and;
    delete filter.$and;
    if (tmp instanceof Array) return tmp.concat(filter);
    return [filter, tmp];
  }

  return [filter];
}

module.exports = (app) => {
  app.database.on("init", ({ collection, db }) => {
    const { contentType } = collection;
    const fieldByType = field2IdType(contentType);

    collection.on("init", 10, () => {
      const { dbArray } = db;
      sortByFunc(dbArray, [{ type: "int", key: "_chdate" }]);
    });

    const addFields2All = (add2id, searchFor, oneSearchField, oneSearchValue) =>
      contentType.item.forEach((oneField) => {
        if (oneField.id && oneField.type !== "date") {
          oneSearchField.push(add2id + oneField.id);
          oneSearchValue.push(searchFor);
        } else if (oneField.add2id)
          addFields2All(
            `${add2id + oneField.add2id}_`,
            searchFor,
            oneSearchField,
            oneSearchValue
          );
      });

    function getFilter(query) {
      const searchField = [];
      const searchValue = [];
      const searchInvert = [];

      getFilterArray(query.filter).forEach((filter) => {
        const oneSearchField = [];
        const oneSearchValue = [];
        const oneSearchInvert = [];

        if (filter.$all && filter.$all !== "")
          addFields2All(
            "",
            createRegExp(filter.$all),
            oneSearchField,
            oneSearchValue
          );

        const exact = filter.__exact || query.exact;
        Object.entries(filter).forEach(([field, value], index) => {
          if (!["$all", "__id", "__exact"].includes(field)) {
            oneSearchField.push(field);

            if (value && value[0] === "!") {
              oneSearchInvert[index] = true;
              value = value.substring(1);
            }

            if (exact) oneSearchValue.push(createRegExp(`^${value}$`));
            else if (value instanceof Array) {
              oneSearchValue.push(createRegExp(value.join("|")));
            } else if (!value) oneSearchValue.push("false");
            else if (value === true) oneSearchValue.push("true");
            else if ("<>".indexOf(value[0]) !== -1) oneSearchValue.push(value);
            else oneSearchValue.push(createRegExp(value, field));
          }
        });

        if (oneSearchField.length > 0) {
          searchField.push(oneSearchField);
          searchValue.push(oneSearchValue);
          searchInvert.push(oneSearchInvert);
        }
      });
      if (searchField.length === 0) return {};
      return { searchField, searchValue, searchInvert };
    }

    function createRegExp(expression, id) {
      if (fieldByType[id] === "boolean") return expression;
      return new RegExp(expression.toString().replace(/\*/g, "\\*"), "i");
    }

    function search(query) {
      if (query.data !== undefined) return;

      const { dbArray } = db;
      query.total = dbArray.length;
      setSearchDefaults(query, contentType);
      let result = [];

      function filterResult(query) {
        const { searchField, searchValue, searchInvert } = getFilter(query);
        if (!searchField) return false;

        for (let pos = 0; pos < dbArray.length; pos++) {
          const thisItem = dbArray[pos];
          let add = false;
          for (let i = 0; i < searchField.length; i++) {
            add = false;
            for (let field = 0; field < searchField[i].length; field++) {
              let val = thisItem[searchField[i][field]];
              const matchVal = searchValue[i][field];
              if (val && val.toString() === "[object Object]")
                val = JSON.stringify(val);

              const addOne =
                (matchVal === "false" && !val) ||
                (matchVal === "true" && val) ||
                (matchVal[0] === "<" &&
                  parseFloat(val) < parseFloat(matchVal.substring(1))) ||
                (matchVal[0] === ">" &&
                  parseFloat(val) > parseFloat(matchVal.substring(1))) ||
                (val && matchVal.test && matchVal.test(val));

              if (
                (addOne && !searchInvert[i][field]) ||
                (!addOne && searchInvert[i][field])
              ) {
                add = true;
                break;
              }
            }
            if (!add) break;
          }
          if (add) result.push(thisItem);
        }
        return true;
      }

      let sortBy =
        query.sortby instanceof Array
          ? query.sortby
          : [query.sortby || "_chdate"];

      let reverse =
        query.reverse instanceof Array
          ? query.reverse
          : [query.reverse || false];

      if (sortBy[0] === "_chdate" && sortBy.length === 1) sortBy = false;
      if (reverse[0] === false && reverse.length === 1) reverse = false;

      if (!query.filter || !filterResult(query)) {
        if (sortBy || (reverse && result.length <= query.count)) {
          result = new Array(dbArray.length);
          let i = dbArray.length;
          while (i--) result[i] = dbArray[i];
        } else result = dbArray;
      }

      query.searchTotal = result.length;

      if (sortBy)
        sortByFunc(
          result,
          sortBy.map((key, index) => ({
            type: fieldByType[key],
            key,
            reverse: reverse[index],
          }))
        );
      else if (reverse[0]) {
        if (result === dbArray) result = [...result];
        result.reverse();
      }
      if (result.length <= query.position) result = [];
      else if (result.length > query.count)
        result = result.slice(query.position, query.position + query.count);

      query.data = result.length ? result : false;
    }
    collection.on("search", 1000, search);
  });
};
