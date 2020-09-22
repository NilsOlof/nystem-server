React.createClass({
  getInitialState: function() {
    var model = this.props.model;
    var view = this.props.view;
    var gitfolder = view.value.gitFolder
      ? view.value.gitFolder
      : view.value.siteFolder + "/.git";
    var state = {
      value: this.props.value,
      commands: {
        status: "mysqldump -uroot -proot sbmforsakring > " +
          view.value.siteFolder +
          ".sql"
      }
    };
    console.log(state.commands);
    app.connection.emit(
      {
        type: "remoteServer",
        event: "mysql",
        server: view.value,
        commands: [
          state.commands.status,
          state.commands.prettyLog,
          state.commands.branch,
          state.commands.rev
        ]
      },
      function(data) {
        //console.log(data);
      }
    );
    app.connection.on("remoteServer", this.event);
    return state;
  },
  event: function(data) {
    if (data.callbackid) return;
    console.log(data);
    var command = "";
    var commands = this.state.commands;
    for (var key in commands) {
      if (commands[key] === data.command) {
        command = key;
        break;
      }
    }
    console.log("Response", command);
    if (command == "status") this.statusParser(data.text.split("\n").slice(1));
    if (command == "prettyLog") this.logParser(data.text.split("\n").slice(1));
    if (command == "rev")
      this.setState({
        atCommit: data.text.split("\n")[1].replace(/[^a-f0-9]/g, "")
      });
    if (command == "branch") this.branchParser(data.text.split("\n").slice(1));
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
          <div className="col-sm-6">{commit[3]}</div>
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
  render: function() {
    var self = this;
    var model = this.props.model;
    var view = this.props.view;
    var className = model.className ? model.className.join(" ") : "";
    function oneItem(title, items) {
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
            {items.map(function(item) {
              return <p>{item}</p>;
            })}
          </div>
        </Panel>
      );
    }

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
        {oneItem("Modified", this.state.modifiedFiles)}
        {oneItem("Deleted", this.state.delFiles)}
        {oneItem("New", this.state.newFiles)}
      </div>
    );
  }
});
// mysqldump -u root -p Tutorials > tut_backup.sql
// mysql -u [uname] -p[pass] [db_to_restore] < [backupfile.sql]
// mysqldump -u [uname] -p[pass] [dbname] | gzip -9 > [backupfile.sql.gz]
// mysql -u [uname] -p[pass] [db_to_restore] < [backupfile.sql]
// This will not put in the CREATE DATABASE and the USE commands in the dump (this is what you want)
// mysqldump -u... -p... --routines --triggers db1 > /root/db1.sql
// This will put in the CREATE DATABASE and the USE commands in the dump
// mysqldump -u... -p... --routines --triggers --databases db1 > /root/db1.sql
