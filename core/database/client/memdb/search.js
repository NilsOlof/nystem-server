const sortFuncInt = key => (a, b) => {
  const x = a[key];
  const y = b[key];
  if (x === undefined) return y === undefined ? 0 : 1;
  if (y === undefined) return -1;
  return x < y ? -1 : x > y ? 1 : 0;
};

const sortFuncText = key => (a, b) => {
  let x = a[key];
  let y = b[key];
  if (x === undefined) return y === undefined ? 0 : 1;
  if (y === undefined) return -1;
  x = x.toString().toLowerCase();
  y = y.toString().toLowerCase();
  return x < y ? -1 : x > y ? 1 : 0;
};

const sortByFunc = (array, sortBys) => {
  const sortFuncs = sortBys.map(({ type, key }) =>
    ["int", "date"].indexOf(type) ? sortFuncInt(key) : sortFuncText(key)
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
    ? items.find(item => item.id === "title")
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

module.exports = app => {
  app.database.on("init", ({ collection, db }) => {
    const { contentType } = collection;
    const fieldByType = field2IdType(contentType);

    collection.on(
      "init",
      () => {
        const { dbArray } = db;
        sortByFunc(dbArray, [{ type: "int", key: "_chdate" }]);
      },
      10
    );

    const addFields2All = (add2id, searchFor, oneSearchField, oneSearchValue) =>
      contentType.item.forEach(oneField => {
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

      getFilterArray(query.filter).forEach(filter => {
        const oneSearchField = [];
        const oneSearchValue = [];
        if (filter.$all && filter.$all !== "")
          addFields2All(
            "",
            createRegExp(filter.$all),
            oneSearchField,
            oneSearchValue
          );

        Object.entries(filter).forEach(([field, value]) => {
          if (field !== "$all" && field !== "__id") {
            oneSearchField.push(field);
            if (query.exact) oneSearchValue.push(createRegExp(`^${value}$`));
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
        }
      });
      if (searchField.length === 0) return {};
      return { searchField, searchValue };
    }

    function createRegExp(expression, id) {
      if (fieldByType[id] === "boolean") return expression;
      return new RegExp(expression.replace(/\*/g, "\\*"), "i");
    }

    function search(query) {
      if (query.data) return;
      const { dbArray } = db;
      query.total = dbArray.length;
      setSearchDefaults(query, contentType);
      let result = [];

      function filterResult(query) {
        const { searchField, searchValue } = getFilter(query);
        if (!searchField) return false;

        for (let pos = 0; pos < dbArray.length; pos++) {
          const thisItem = dbArray[pos];
          let add = false;
          for (let i = 0; i < searchField.length; i++) {
            add = false;
            for (let field = 0; field < searchField[i].length; field++) {
              let val = thisItem[searchField[i][field]];
              const matchVal = searchValue[i][field];
              if (val && val.toString() === "[object Object]") {
                val = JSON.stringify(val);
              }
              if (
                (matchVal === "false" && !val) ||
                (matchVal === "true" && val) ||
                (matchVal[0] === "<" &&
                  parseFloat(val) < parseFloat(matchVal.substring(1))) ||
                (matchVal[0] === ">" &&
                  parseFloat(val) > parseFloat(matchVal.substring(1))) ||
                (val && matchVal.test && matchVal.test(val))
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
        query.sortby && query.sortby !== "_chdate" ? query.sortby : false;

      if (!query.filter || !filterResult(query)) {
        if (sortBy || (query.reverse && result.length <= query.count)) {
          result = new Array(dbArray.length);
          let i = dbArray.length;
          while (i--) result[i] = dbArray[i];
        } else result = dbArray;
      }

      query.searchTotal = result.length;

      if (sortBy) {
        sortBy = sortBy instanceof Array ? sortBy : [sortBy];
        sortByFunc(
          result,
          sortBy.map(key => ({ type: fieldByType[key], key }))
        );
      }

      if (result.length > query.count) {
        if (query.reverse) {
          result = result.slice(
            result.length - query.position - query.count,
            result.length - query.position
          );
          result.reverse();
        } else
          result = result.slice(query.position, query.position + query.count);
      } else if (query.reverse) result.reverse();

      query.data = result.length ? result : false;
    }
    collection.on("search", 1000, search);
  });
};
