React.createClass({
  handleSubmit: function(event) {
    var value = this.props.view.value;
    var model = this.props.model;
    var self = this;
    function insertVal(val) {
      if (!val) return val;
      return val.replace(/\{([a-z_.]+)\}/img, function(str, p1, offset, s) {
        return value[p1.replace("..", self.props.path)];
      });
    }
    if (event) event.preventDefault();
    var data = {};
    for (var i = 0; model.insertVal && i < model.insertVal.length; i++)
      data[model.insertVal[i][0]] = insertVal(model.insertVal[i][1]);
    app.database[model.contentType].save(
      {
        data: data
      },
      function(id) {
        app.router.click(
          "/" + model.contentType + "/" + model.goToFormat + "/" + id
        );
      }
    );
  },
  render: function() {
    var model = this.props.model;
    var className = model.className ? model.className.join(" ") : "";
    return (
      <div className={className}>
        <button
          type="button"
          onClick={this.handleSubmit}
          className="btn btn-primary btn-xs"
        >
          Add
        </button>
      </div>
    );
  }
});
