import { randomBytes } from "node:crypto";

const cookieName = "requesttoken";
const maxIdle = 1000 * 60 * 60 * 24;
const maxTokens = 10000;

export default (app) => {
  app.on("start", (app) => {
    const reqs = {};
    // Random secret token in the cookie, mapped to the request id here so a client can't pick one
    const tokens = {};
    const queues = {};
    const cancelPolls = new Map();

    const maxSizeAnonymous = app.settings.maxMessageSizeAnonymous || 1024 * 1024;
    const maxSizeLoggedIn = app.settings.maxMessageSize || 512 * 1024 * 1024;

    setInterval(
      () => {
        const limit = Date.now() - maxIdle;
        Object.keys(tokens).forEach((token) => {
          if (tokens[token].used >= limit) return;
          delete queues[tokens[token].requestId];
          delete tokens[token];
        });
      },
      1000 * 60 * 60,
    );

    const readToken = (cookie = "") => {
      const item = cookie
        .split(";")
        .map((part) => part.trim())
        .find((part) => part.startsWith(`${cookieName}=`));
      const token = item?.substring(cookieName.length + 1);
      return token && tokens[token] ? token : undefined;
    };

    app.connection.on("emit", (data) => {
      const queue = queues[data.id];
      if (!queue?.received || Date.now() - queue.received > 60000) return;
      if (queue.messages.length >= 1000) queue.messages.shift();
      queue.messages.push(data);
      queue.wake?.();
      return { ...data, missing: false };
    });

    app.file.on("response", ({ id, close, abort }) => {
      if (close || abort) cancelPolls.get(id)?.();
    });

    app.file.on("post", async ({ id, url = "", headers }) => {
      if (!url.startsWith("/httpsfallback")) return;
      reqs[id] = { body: "", token: readToken(headers?.cookie), headers };
    });

    app.file.on("post", async ({ id, data, closed, abort }) => {
      const req = reqs[id];
      if (req === undefined) return;
      if (abort) {
        delete reqs[id];
        return;
      }

      if (data) {
        req.body += data.toString();
        if (req.body.length > (req.token ? maxSizeLoggedIn : maxSizeAnonymous)) {
          delete reqs[id];
          app.file.event("response", { id, data: "{}", statusCode: 413, closed: true });
          return;
        }
      }

      if (!closed) return;
      delete reqs[id];

      let event;
      try {
        event = JSON.parse(req.body);
      } catch (e) {
        event = undefined;
      }

      const headers = {};
      let token = tokens[req.token] && req.token;
      if ((req.body === "{}" || ["login", "receive"].includes(event?.type)) && !token) {
        const active = Object.keys(tokens);
        if (active.length >= maxTokens) {
          const oldest = active.reduce((a, b) => (tokens[a].used <= tokens[b].used ? a : b));
          delete queues[tokens[oldest].requestId];
          delete tokens[oldest];
        }
        token = randomBytes(32).toString("hex");
        tokens[token] = { requestId: id };
        queues[id] = { messages: [] };
        const secure = app.settings.client.secure || req.headers?.["x-forwarded-proto"] === "https";
        headers["Set-Cookie"] = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
      }
      if (token) tokens[token].used = Date.now();

      if (req.body === "{}") {
        app.file.event("response", { id, headers, data: "{}", closed: true });
        return;
      }

      if (event?.type === "receive") {
        const queue = queues[tokens[token].requestId];
        queue.wake?.();
        queue.received = Date.now();
        const respond = () => {
          cancelPolls.get(id)?.();
          queue.received = Date.now();
          const messages = queue.messages.splice(0);
          app.file.event("response", {
            id,
            headers,
            data: JSON.stringify({ type: "receive", messages }),
            closed: true,
          });
        };
        if (queue.messages.length) respond();
        else {
          const timer = setTimeout(respond, 25000);
          queue.wake = respond;
          cancelPolls.set(id, () => {
            clearTimeout(timer);
            queue.wake = undefined;
            cancelPolls.delete(id);
          });
        }
        return;
      }

      const query = app.connection.fromClient(event, token ? tokens[token].requestId : id);
      if (!query) {
        app.file.event("response", { id, data: "{}", statusCode: 400, closed: true });
        return;
      }
      const result = await app.connection.event(query.type, query);
      if (query.type === "logout" && token) {
        delete queues[tokens[token].requestId];
        delete tokens[token];
      }

      app.file.event("response", { id, headers, data: JSON.stringify(result), closed: true });
    });
  });
};
