React.createClass({
  getInitialState: function() {
    var model = this.props.model;
    var view = this.props.view;
    var gitfolder = view.value.gitFolder
      ? view.value.gitFolder
      : view.value.siteFolder + "/.git";
    // Viewing single commit diff in Git
    // git show <commit>
    var state = {
      value: this.props.value,
      commands: {
        status: 'git --work-tree="' +
          view.value.siteFolder +
          '" --git-dir="' +
          gitfolder +
          '" status --porcelain',
        diff: 'git --work-tree="' +
          view.value.siteFolder +
          '" --git-dir="' +
          gitfolder +
          '" --no-pager diff -- ',
        log: 'git --work-tree="' +
          view.value.siteFolder +
          '" --git-dir="' +
          gitfolder +
          '" log -10',
        prettyLog: 'git --no-pager --git-dir="' +
          gitfolder +
          '" log --pretty=format:"%H :: %an :: %ad :: %s"',
        branch: 'git --work-tree="' +
          view.value.siteFolder +
          '" --git-dir="' +
          gitfolder +
          '" branch',
        show: 'git --work-tree="' +
          view.value.siteFolder +
          '" --git-dir="' +
          gitfolder +
          '" --no-pager show ',
        rev: 'git --work-tree="' +
          view.value.siteFolder +
          '" --git-dir="' +
          gitfolder +
          '" rev-parse HEAD'
      },
      diff: {}
    };
    this.doLoad(state);
    app.connection.on("remoteServer", this.event);
    app.on("logEvent", this.doLoad);
    return state;
  },
  doLoad: function(state) {
    if (state.type == "diff") return;
    if (!state || !state.commands) state = this.state;
    var view = this.props.view;
    app.connection.emit({
      type: "remoteServer",
      event: "git",
      server: view.value,
      commands: state.commands.status
    });
    app.connection.emit({
      type: "remoteServer",
      event: "git",
      server: view.value,
      commands: state.commands.prettyLog
    });
    app.connection.emit({
      type: "remoteServer",
      event: "git",
      server: view.value,
      commands: state.commands.branch
    });
    app.connection.emit({
      type: "remoteServer",
      event: "git",
      server: view.value,
      commands: state.commands.rev
    });
  },
  event: function(data) {
    if (data.callbackid || data.event != "git") return;
    console.log(data);
    var command = "";
    var commands = this.state.commands;
    if (data.command)
      for (var key in commands)
        if (data.command.indexOf(commands[key]) === 0) {
          command = key;
          break;
        }

    console.log("Response", command);
    if (command == "status")
      this.statusParser(data.text.split("\n").slice(1));
    else if (command == "prettyLog")
      this.logParser(data.text.split("\n").slice(1));
    else if (command == "rev")
      this.setState({
        atCommit: data.text.split("\n")[1].replace(/[^a-f0-9]/g, "")
      });
    else if (command == "branch")
      this.branchParser(data.text.split("\n").slice(1));
    else if (command == "diff")
      app.event("logEvent", {
        log: data.text.replace(/\[m/g, ""), // .replace(/\n/g,'')
        type: "diff"
      });
  },
  branchParser: function(branches) {
    var out = [];
    for (var i = 0; i < branches.length - 1; i++)
      out.push(branches[i].split("[m")[0]);
    this.setState({
      branches: out
    });
  },
  logParser: function(commits) {
    var out = [];
    var commitsbyId = {};
    for (var i = 0; i < commits.length - 1 && i < 100; i++) {
      var commit = commits[i].split(" :: ");
      console.log(commit[0], commit[0].substring(0, 5));
      if (commit[0].substring(0, 5) === "[?1h=") {
        commit[0] = commit[0].substring(5);
        atCommit = commit[1];
      }
      commitsbyId[commit[0]] = commit;
      out.push(
        <div className="row" title={commit[0]}>
          <div className="col-sm-6">
            <a href={"#" + commit[0]} onClick={this.showCommit}>{commit[3]}</a>
          </div>
          <div className="col-sm-2">{commit[1]}</div>
          <div className="col-sm-4">{commit[2].replace(/\+[012]+/, "")}</div>
        </div>
      );
    }
    this.setState({
      commits: out,
      commitsbyId: commitsbyId
    });
  },
  statusParser: function(files) {
    var modifiedFiles = [];
    var newFiles = [];
    var delFiles = [];
    for (var i = 0; i < files.length; i++) {
      if (files[i].substring(0, 3) == " M ")
        modifiedFiles.push(files[i].substring(3));
      else if (files[i].substring(0, 3) == "?? ")
        newFiles.push(files[i].substring(3));
      else if (files[i].substring(0, 3) == " D ")
        delFiles.push(files[i].substring(3));
    }
    this.setState({
      modifiedFiles: modifiedFiles,
      newFiles: newFiles,
      delFiles: delFiles
    });
  },
  componentWillUnmount: function() {
    app.off("logEvent", this.doLoad);
  },
  onClick: function(e) {
    e.preventDefault();
    var self = this;
    var view = this.props.view;
    var file = e.currentTarget.innerText;
    app.connection.emit(
      {
        type: "remoteServer",
        event: "git",
        server: view.value,
        commands: [this.state.commands.diff + file + ""]
      },
      function(data) {
        console.log(data);
        self.state.diff[file.replace(/[^a-z\/\.]/gi, "")] = data.text;
        self.setState({
          diff: self.state.diff
        });
      }
    );
    self.state.diff[file.replace(/[^a-z\/\.]/gi, "")] = true;
    self.setState({
      diff: self.state.diff
    });
    //console.log(this.state.commands.diff + e.currentTarget.innerText);
  },
  showCommit: function(e) {
    e.preventDefault();
    var self = this;
    var view = this.props.view;
    var href = e.currentTarget.href;
    href = href.substring(href.indexOf("#") + 1);
    app.connection.emit(
      {
        type: "remoteServer",
        event: "git",
        server: view.value,
        commands: [this.state.commands.show + href + ""]
      },
      function(data) {
        console.log(data);
        return;
        self.state.diff[file.replace(/[^a-z\/\.]/gi, "")] = data.text;
        self.setState({
          diff: self.state.diff
        });
      }
    );
  },
  render: function() {
    var self = this;
    var model = this.props.model;
    var view = this.props.view;
    var className = model.className ? model.className.join(" ") : "";
    function oneItem(title, items, clickEvent) {
      if (!items) return null;
      if (!items.length) return <p>{title} empty</p>;
      var large = items.length > 10;
      return (
        <Panel expandable={large} expanded={!large} icon={large} type="primary">
          <h3 onClickExpand="true">
            {title}
            <div className="pull-right col-sm-2 align-center">
              {items.length}
            </div>
          </h3>
          <div>
            {items.map(function(item, index) {
              if (clickEvent) {
                var thisDiff = diff[item.replace(/[^a-z\/\.]/gi, "")];
                if (thisDiff === true)
                  return (
                    <p key={index} className="alert-info">
                      &nbsp;Loading diff ...
                    </p>
                  );
                else if (thisDiff)
                  return (
                    <RemoteServerGitDiffParser
                      kay={index}
                      expanded="true"
                      value={thisDiff}
                      text={item}
                    />
                  );
                else
                  return (
                    <p key={index}>
                      <a href="#" onClick={self.onClick}>{item}</a>
                    </p>
                  );
              } else
                return <p key={index}>{item}</p>;
            })}
          </div>
        </Panel>
      );
    }
    var diff = this.state.diff;

    var atCommit = this.state.atCommit &&
      this.state.commitsbyId &&
      this.state.commitsbyId[this.state.atCommit]
      ? this.state.commitsbyId[this.state.atCommit][3]
      : null;
    return (
      <div className={className}>
        <p>At: {atCommit}</p>
        {oneItem("Commits", this.state.commits)}
        {oneItem("Branches", this.state.branches)}
        <h4>Status</h4>
        {oneItem("Modified", this.state.modifiedFiles, true)}
        {oneItem("Deleted", this.state.delFiles)}
        {oneItem("New", this.state.newFiles)}
      </div>
    );
  }
});
