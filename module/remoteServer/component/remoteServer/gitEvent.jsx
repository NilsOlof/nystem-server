React.createClass({
  getInitialState: function() {
    var state = {
      confirm: false
    };
    return state;
  },
  componentWillUnmount: function() {
    if (this.delayTimer) clearTimeout(this.delayTimer);
  },
  confirm: function() {
    var self = this;
    var model = this.props.model;
    var view = this.props.view;
    var gitfolder = view.value.gitFolder
      ? view.value.gitFolder
      : view.value.siteFolder + "/.git";
    if (this.state.confirm || !model.confirm)
      app.connection.emit(
        {
          type: "remoteServer",
          event: "git",
          server: view.value,
          commands: [
            'git --work-tree="' +
              view.value.siteFolder +
              '" --git-dir="' +
              gitfolder +
              '" ' +
              model.event
          ]
        },
        function(data) {
          console.log(data);
        }
      );
    else {
      this.setState({
        confirm: true
      });
      this.delayTimer = setTimeout(this.revert, 1000);
    }
  },
  revert: function() {
    var model = this.props.model;
    if (this.delayTimer) clearTimeout(this.delayTimer);
    if (this.isMounted())
      this.setState({
        confirm: false
      });
  },
  render: function() {
    var model = this.props.model;
    var className = model.className ? model.className.join(" ") : "";
    return (
      <button
        ref="submit"
        type="button"
        onClick={this.confirm}
        className={className + " btn btn-" + model.btnType}
      >
        {app.t(this.state.confirm ? model.confirmText : model.text)}
      </button>
    );
  }
});
