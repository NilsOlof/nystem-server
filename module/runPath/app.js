#!/usr/bin/env node

"use strict";

const { spawn } = require("child_process");

const args = [process.argv[2] || "server.js", ...process.argv.slice(3)];

const opt = {
  cwd: __dirname,
  env: (() => {
    process.env.NODE_PATH = `${__dirname}/node_modules`;
    process.env.NODE__DIRNAME = __dirname;
    return process.env;
  })(),
  detached: false,
  stdio: [process.stdin, process.stdout, process.stderr],
};

const app = spawn(process.execPath, args, opt);

process.on("exit", () => {
  app.kill();
});
