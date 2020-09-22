React.createClass({
  clearLog: function(e) {
    e.preventDefault();
    app.connection.emit({
      type: "serverStatus",
      server: this.props.view.id,
      clear: true
    });
  },
  render: function() {
    var model = this.props.model;
    var className = model.className && !this.props.wrapper
      ? model.className.join(" ") + " btn-default"
      : "btn-default";
    return (
      <button className={className} onClick={this.clearLog}>Clear log</button>
    );
  }
});
