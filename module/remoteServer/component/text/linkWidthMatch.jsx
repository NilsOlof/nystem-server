React.createClass({
  render: function() {
    var model = this.props.model;
    var view = this.props.view;
    var className = model.className && !this.props.wrapper
      ? model.className.join(" ")
      : "";
    if (!React.DOM[model.renderAs] || model.renderAs == "input")
      model.renderAs = "div";
    var id = view.value ? "/" + view.value._id : "";
    var type = this.props.wrapper == "li" ? "list" : null;
    var format = model.toFormat ? model.toFormat : "input";
    var params = view.params;
    var addToPath = !params ||
      params.length === 1 ||
      view.contentType == params[0]
      ? ""
      : "/" + params[0];
    var match = model.match;
    if (match && view.value) {
      match = app.utils.clone(model.match);
      for (var i = 0; i < match.length; i++)
        match[i] = match[i].replace("{_id}", view.value._id);
    }
    var component = (
      <Link
        type={type}
        href={addToPath + "/" + view.contentType + "/" + format + id}
        onClick={app.router.click}
        match={match}
      >
        {this.props.value ? this.props.value : model.fallback}
      </Link>
    );
    if (this.props.wrapper == "li") return component;
    return React.createElement(
      model.renderAs,
      {
        className: className
      },
      component
    );
  }
});
