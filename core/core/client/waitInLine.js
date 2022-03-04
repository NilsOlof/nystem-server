const lines = {};
const queues = {};

const timeout = (timeout) =>
  new Promise((resolve) => setTimeout(() => resolve("timeout"), timeout));

const run = async (name) => {
  const line = lines[name];
  const { delay, timeOut } = line;

  const call = queues[name].shift();
  if (!call) return;

  line.running++;
  const status = await Promise.race([call(), timeout(timeOut)]);

  if (status === "timeout")
    console.error(`Stand in line timeout error for ${name}`);

  setTimeout(() => {
    line.running--;
    run(name);
  }, delay);
};

const defaultOptions = { timeOut: 120000, limit: 1, delay: 0, running: 0 };
const init = (name, options = {}) => {
  lines[name] = { ...defaultOptions, ...options };
  queues[name] = [];
};

const waitInLine = (name, callback) =>
  new Promise((resolve, reject) => {
    if (!queues[name]) {
      console.error(`Missing line ${name}`);
      return;
    }
    queues[name].push(async () => {
      try {
        const res = await callback();
        resolve(res);
      } catch (e) {
        reject(e);
      }
    });

    const { limit, running } = lines[name];
    if (limit > running) run(name);
  });

const waitInLineCount = (name) => queues[name].length;

module.exports = { init, waitInLine, waitInLineCount };
