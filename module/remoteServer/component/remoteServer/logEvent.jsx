React.createClass({
  getInitialState: function() {
    this.model = this.props.model;
    var state = {
      log: ""
    };
    app.on("logEvent", this.logEvent);
    return state;
  },
  logEvent: function(data) {
    if (
      this.model.event instanceof Array &&
      this.model.event.length &&
      this.model.event.indexOf(data.event) == -1
    )
      return;
    var log = data.log.split("\n");
    log.pop();
    log.shift();
    this.setState({
      log: log.join("\n")
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
  componentWillUnmount: function() {
    app.off("logEvent", this.logEvent);
    window.removeEventListener("scroll", this.scrollStop, false);
  },
  componentDidUpdate: function(prevProps, prevState) {
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
  shouldComponentUpdate: function(nextProps, nextState) {
    return nextState.log !== this.state.log;
  },
  scrollStop: function() {
    document.body.scrollTop = 0;
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
