module.exports = function (app, settings, ssh, sftp) {
  const { fs } = app;

  function addSudo(server, cat) {
    if (server.username === "root" || (server.withoutSudo && cat !== "service"))
      return "";
    return "sudo ";
  }

  const self = {
    nginx: {
      installService: {
        proxy: function (server, callback) {
          ssh(server, [
            "sudo cp {siteFolder}nodenginxproxy.conf /etc/nginx/sites-available/{url}.conf",
            "sudo ln -s /etc/nginx/sites-available/{url}.conf /etc/nginx/sites-enabled/{url}.conf",
            "sudo service nginx restart",
          ]);
        },
      },
    },
    git: {
      install: function (server, callback) {
        /*
         if depends error
         sudo apt-get update
          sudo apt-get upgrade
          sudo apt-get install -f
        */
        ssh(server, "sudo apt-get install --force-yes -y git", callback);
      },
      pull: function (server, callback) {
        const gitfolder = server.gitFolder
          ? server.gitFolder
          : `${server.siteFolder}/.git`;
        ssh(
          server,
          `git --work-tree="${server.siteFolder}" --git-dir="${gitfolder}" pull`,
          callback
        );
      },
      fetch: function (server, callback) {
        const gitfolder = server.gitFolder
          ? server.gitFolder
          : `${server.siteFolder}/.git`;
        ssh(
          server,
          `git --work-tree="${server.siteFolder}" --git-dir="${gitfolder}" fetch`,
          callback
        );
      },
      clean: function (server, callback) {
        const gitfolder = server.gitFolder
          ? server.gitFolder
          : `${server.siteFolder}/.git`;
        ssh(
          server,
          `git --work-tree="${server.siteFolder}" --git-dir="${gitfolder}" clean -d -f`,
          callback
        );
      },
      reset: function (server, callback) {
        const gitfolder = server.gitFolder
          ? server.gitFolder
          : `${server.siteFolder}/.git`;
        ssh(
          server,
          `git --work-tree="${server.siteFolder}" --git-dir="${gitfolder}" reset --hard HEAD`,
          callback
        );
      },
    },
    node: {
      install: function (server, callback) {
        ssh(
          server,
          [
            "curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -",
            "sudo apt-get install --force-yes -y nodejs",
          ],
          callback
        );
      },

      installService: function (server, callback) {
        let nodeservice = fs.readFileSync(
          `${__dirname}/nodeservice.conf`,
          "utf8"
        );
        nodeservice = app.utils.insertValues(nodeservice, server);
        fs.writeFileSync(`${__dirname}/tmp`, nodeservice, "utf8");

        sftp(
          server,
          "upload",
          `${__dirname}/tmp`,
          "{homeFolder}/nodeservice.conf",
          () => {
            ssh(
              server,
              "sudo cp {homeFolder}/nodeservice.conf /etc/systemd/system/{url}.service",
              (data) => {
                if (fs.existsSync(`${__dirname}/tmp`))
                  fs.unlinkSync(`${__dirname}/tmp`);
                callback(data);
              }
            );
          }
        );
      },

      start: function (server, callback) {
        let command = "pm2 start {url}";
        if (server.nodeService)
          command = command.replace("{url}", "{nodeService}");
        ssh(server, addSudo(server, "service") + command, callback);
      },

      stop: function (server, callback) {
        let command = "pm2 stop {url}";
        if (server.nodeService)
          command = command.replace("{url}", "{nodeService}");
        ssh(server, addSudo(server, "service") + command, callback);
      },

      restart: function (server, callback) {
        let command = "pm2 restart {url}";
        if (server.nodeService)
          command = command.replace("{url}", "{nodeService}");
        ssh(server, addSudo(server, "service") + command, callback);
      },
    },

    install: function (server, callback) {
      self.nginx.proxy(server, callback);
    },
    log: {
      apache: function (server, callback) {
        ssh(
          server,
          `${addSudo(server)}tail -n100 /var/log/apache2/error.log`,
          callback
        );
      },
      longapache: function (server, callback) {
        ssh(
          server,
          `${addSudo(server)}tail -n500 /var/log/apache2/error.log`,
          callback
        );
      },
      node: function (server, callback) {
        ssh(server, `${addSudo(server)}pm2 logs {nodeService}`, callback);
      },
      longnode: function (server, callback) {
        ssh(
          server,
          `${addSudo(server)}pm2 logs {nodeService} --lines 1000`,
          callback
        );
      },
      sys: function (server, callback) {
        ssh(server, `${addSudo(server)}tail -n100 /var/log/syslog`, callback);
      },
      longsys: function (server, callback) {
        ssh(server, `${addSudo(server)}tail -n500 /var/log/syslog`, callback);
      },
      systemd: function (server, callback) {
        ssh(server, `${addSudo(server)}systemd -u {nodeService}`, callback);
      },
      listenNode: function (server, callback) {
        // http://serverfault.com/questions/1669/shell-command-to-monitor-changes-in-a-file-whats-it-called-again
        ssh(server, `${addSudo(server)}tail -f  {log}/{url}.log`, callback);
      },
    },
  };
  return self;
};
