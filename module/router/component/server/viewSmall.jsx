React.createClass({
  getInitialState: function() {
    var self = this;
    if (this.props.value)
      app.connection.emit({
        type: "serverStatus",
        server: self.props.value._id
      });
    app.connection.on("serverStatus", this.updateStatus);
    //console.log(this.props.value);
    return {};
  },
  updateStatus: function(data) {
    if (data.server == this.props.value._id) {
      if (this.state.running != data.running) {
        this.setState({ running: data.running });
      }
    }
  },
  startService: function(e) {
    e.preventDefault();
    console.log("start");
    var self = this;
    app.connection.emit({
      type: "serverStatus",
      server: self.props.value._id,
      change: "start"
    });
  },
  stopService: function(e) {
    e.preventDefault();
    var self = this;
    app.connection.emit({
      type: "serverStatus",
      server: self.props.value._id,
      change: "stop"
    });
  },
  componentWillUnmount: function() {
    app.connection.off("serverStatus", this.updateStatus);
  },
  render: function() {
    var model = this.props.model;
    var className = model.className && !this.props.wrapper
      ? model.className.join(" ")
      : "";
    if (this.props.value && this.props.value.host == app.settings.domain)
      return <div className={className} />;
    if (this.state.running)
      return (
        <div className={className}>
          <button
            onClick={this.stopService}
            className="btn-default btn-danger btn-sm"
          >
            <span className="glyphicon glyphicon-stop" />
          </button>
        </div>
      );
    return (
      <div className={className}>
        <button onClick={this.startService} className="btn-default btn-sm">
          <span className="glyphicon glyphicon-play" />
        </button>
      </div>
    );
  }
});
