React.createClass({
  getInitialState: function() {
    var self = this;
    if (this.props.value)
      app.connection.emit({
        type: "serverStatus",
        server: self.props.value._id
      });
    app.connection.on("serverStatus", this.updateStatus);
    console.log(this.props.value);
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
    var className = model.className ? model.className.join(" ") : "";
    if (this.props.value && this.props.value.host == app.settings.domain)
      return (
        <button
          className={className + " btn-default btn-disabled"}
          disabled="disabled"
        >
          Running
        </button>
      );
    if (this.state.running)
      return (
        <button
          onClick={this.stopService}
          className={className + " btn-default btn-danger"}
        >
          Stop
        </button>
      );
    return (
      <button
        onClick={this.startService}
        className={className + " btn-default"}
      >
        Start
      </button>
    );
  }
});
