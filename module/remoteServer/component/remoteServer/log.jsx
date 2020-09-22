React.createClass({
  getInitialState: function() {
    this.model = this.props.model;
    var state = {
      log: ""
    };
    this.valid = false;
    this.submitForm = false;
    var self = this;
    console.log(this.props.view.value);
    app.connection.emit(
      {
        type: "remoteServer",
        server: this.props.view.value,
        event: this.model.event
      },
      function(data) {
        if (self.isMounted())
          self.setState({
            log: data.log
          });
        else
          state.log = data.log;
        app.connection.on("remoteServer", self.serverLog);
      }
    );
    return state;
  },
  serverLog: function(data) {
    if (
      data.server != this.props.view.value._id || data.event != this.model.event
    )
      return;
    this.setState({
      log: data.clear ? data.log ? data.log : "" : this.state.log + data.log
    });
  },
  componentDidMount: function(prevProps, prevState, rootNode) {
    if (!this.refs.log) return;
    var objLog = this.refs.log;
    if (!this.model.height) {
      objLog.style.height = window.innerHeight - 120 + "px";
      objLog.style.overflow = "auto";
      objLog.scrollTop = objLog.scrollHeight;
      window.addEventListener("scroll", this.scrollStop, false);
    } else
      objLog.style.height = this.model.height + "px";
  },
  scrollStop: function() {
    document.body.scrollTop = 0;
  },
  componentWillUnmount: function() {
    app.connection.off("remoteServer", this.serverLog);
    window.removeEventListener("scroll", this.scrollStop, false);
  },
  render: function() {
    var model = this.props.model;
    var className = model.className && !this.props.wrapper
      ? model.className.join(" ")
      : "";
    return (
      <div className={className}>
        <pre ref="log"><code>{this.state.log}</code></pre>
      </div>
    );
  }
});
