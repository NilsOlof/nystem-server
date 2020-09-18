module.exports = function(app) {
  app.views = function(name) {
    const contentType = app.contentType[name];
    return {
      view: function(name) {
        const view = false;
        for (const item in contentType.views)
          if (
            contentType.views[item].name === name ||
            contentType.views[item].id === name
          ) {
            view = contentType.views[item];
            break;
          }
        if (!view) return false;
        const self = {
          get: function() {
            return view;
          },
          ids: function() {
            const out = { $all: [] };
            function parse(model) {
              const id = model.id ? model.id : model.addid ? model.addid : "";
              for (const item in model.item)
                parse(model.item[item]);
              if (id && model.category) {
                if (!out[model.category]) out[model.category] = [];
                out[model.category].push(id);
                out.$all.push(id);
              }
            }
            parse(view);
            return out;
          },
          insertValues: function(data, value, idType) {
            const ids = self.ids()[idType];
            for (const id in ids)
              data[ids[id]] = value[ids[id]];
          }
        };
        return self;
      }
    };
  };
};
