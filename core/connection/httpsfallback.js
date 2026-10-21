import { randomBytes } from "node:crypto";

const cookieName = "requesttoken";
const maxIdle = 1000 * 60 * 60 * 24;

export default (app) => {
  app.on("start", (app) => {
    const reqs = {};
    // Random secret token in the cookie, mapped to the request id here so a client can't pick one
    const tokens = {};

    const maxSizeAnonymous = app.settings.maxMessageSizeAnonymous || 1024 * 1024;
    const maxSizeLoggedIn = app.settings.maxMessageSize || 512 * 1024 * 1024;

    setInterval(
      () => {
        const limit = Date.now() - maxIdle;
        Object.keys(tokens).forEach((token) => tokens[token].used < limit && delete tokens[token]);
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

      if (req.body === "{}") {
        app.file.event("response", { id, data: "{}", closed: true });
        return;
      }

      let event;
      try {
        event = JSON.parse(req.body);
      } catch (e) {
        event = undefined;
      }

      const headers = {};
      let { token } = req;
      if (event?.type === "login" && !token) {
        token = randomBytes(32).toString("hex");
        tokens[token] = { requestId: id };
        const secure = app.settings.client.secure || req.headers?.["x-forwarded-proto"] === "https";
        headers["Set-Cookie"] = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict${secure ? "; Secure" : ""}`;
      }
      if (token) tokens[token].used = Date.now();

      const query = app.connection.fromClient(event, token ? tokens[token].requestId : id);
      if (!query) {
        app.file.event("response", { id, data: "{}", statusCode: 400, closed: true });
        return;
      }
      const result = await app.connection.event(query.type, query);
      if (query.type === "logout" && token) delete tokens[token];

      app.file.event("response", { id, headers, data: JSON.stringify(result), closed: true });
    });
  });
};
