React.createClass({
  getInitialState: function() {
    var state = {
      confirm: false,
      working: false,
      done: false,
      last: false
    };
    app.on("logEvent", this.logEvent);
    return state;
  },
  logEvent: function(data) {
    if (this.runTimer) clearTimeout(this.runTimer);
    if (this.state.last)
      this.setState({
        last: false
      });
  },
  componentWillUnmount: function() {
    if (this.delayTimer) clearTimeout(this.delayTimer);
    if (this.runTimer) clearTimeout(this.runTimer);
    app.off("logEvent", this.serverLog);
  },
  confirm: function() {
    var model = this.props.model;
    if (this.state.confirm || !model.confirm)
      this.doEvent();
    else {
      this.setState({
        confirm: true
      });
      this.delayTimer = setTimeout(this.revert, 1000);
    }
  },
  doEvent: function() {
    var self = this;
    var view = this.props.view;
    var model = this.props.model;
    if (this.runTimer) clearTimeout(this.runTimer);
    this.setState({
      working: true,
      done: false
    });
    app.connection.emit(
      {
        type: "remoteServer",
        event: "custom",
        server: view.value,
        command: model.event
      },
      function(data) {
        app.event("logEvent", {
          log: data.response,
          event: model.event
        });
        self.setState({
          working: false,
          done: true,
          last: true
        });
        self.delayTimer = setTimeout(self.revert, 1000);
        if (model.ifLastRunEverySec && self.state.last)
          self.runTimer = setTimeout(
            self.doEvent,
            1000 * model.ifLastRunEverySec
          );
      }
    );
  },
  revert: function() {
    var model = this.props.model;
    if (this.delayTimer) clearTimeout(this.delayTimer);
    if (this.isMounted())
      this.setState({
        confirm: false,
        done: false
      });
  },
  componentDidMount: function(prevProps, prevState, rootNode) {
    var model = this.props.model;
    if (model.runOnLoad) this.doEvent();
  },
  render: function() {
    var model = this.props.model;
    var text = model.text;
    var btnType = model.btnType;
    if (this.state.confirm && model.confirmText) {
      text = model.confirmText;
      btnType = model.btnTypeConfirm;
    }
    if (this.state.working && model.workingText) {
      text = model.workingText;
      btnType = model.btnTypeWorking;
    }
    if (this.state.last && model.lastText) {
      text = model.lastText;
      btnType = model.btnTypeLast;
    }
    if (this.state.done && model.doneText) {
      text = model.doneText;
      btnType = model.btnTypeDone;
    }
    var className = model.className ? model.className.join(" ") : "";
    return (
      <button
        ref="submit"
        type="button"
        onClick={this.confirm}
        className={className + " btn btn-" + btnType}
      >
        {app.t(text)}
      </button>
    );
  }
});
