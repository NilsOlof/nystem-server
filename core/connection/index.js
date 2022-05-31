/* eslint-disable no-bitwise */
const crypto = require("crypto");

module.exports = (app) => {
  app.connection = app.addeventhandler({}, ["emit", "broadcast", "count"]);

  if (!app.settings.client.domain) return;

  require("./httpsfallback")(app);

  const clients = {};
  let connectedCount = 0;

  const encode = (data) => {
    let header;
    const payload = Buffer.from(data);
    const len = payload.length;

    if (len <= 125) {
      header = Buffer.alloc(2);
      header[1] = len;
    } else if (len <= 0xffff) {
      header = Buffer.alloc(4);
      header[1] = 126;
      header[2] = (len >> 8) & 0xff;
      header[3] = len & 0xff;
    } else {
      /* 0xffff < len <= 2^63 */
      header = Buffer.alloc(10);
      header[1] = 127;
      header[2] = (len >> 56) & 0xff;
      header[3] = (len >> 48) & 0xff;
      header[4] = (len >> 40) & 0xff;
      header[5] = (len >> 32) & 0xff;
      header[6] = (len >> 24) & 0xff;
      header[7] = (len >> 16) & 0xff;
      header[8] = (len >> 8) & 0xff;
      header[9] = len & 0xff;
    }

    header[0] = 0x81;
    return Buffer.concat([header, payload], header.length + payload.length);
  };

  const decode = (data, callback) => {
    if (!data.length) return;

    const datalength = data[1] & 127;

    let indexFirstMask = 2;
    if (datalength === 126) indexFirstMask = 4;
    else if (datalength === 127) indexFirstMask = 10;

    const masks = data.slice(indexFirstMask, indexFirstMask + 4);
    let i = indexFirstMask + 4;
    let index = 0;
    let output = "";
    let para = 0;

    while (i < data.length) {
      const char = String.fromCharCode(data[i++] ^ masks[index++ % 4]);
      if (char === "{") para++;
      if (char === "}") para--;
      output += char;
      if (para === 0) break;
    }

    callback(output);
    decode(data.slice(i), callback);
  };

  app.on("start", () => {
    app.file.on("socket", ({ id, req, socket }) => {
      const key = req.headers["sec-websocket-key"];
      const sha1 = crypto.createHash("sha1");
      sha1.update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`);
      const acceptKey = sha1.digest("base64");

      socket.write(
        // eslint-disable-next-line prefer-template
        "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
          "Upgrade: WebSocket\r\n" +
          "Connection: Upgrade\r\n" +
          "Sec-WebSocket-Accept: " +
          acceptKey +
          "\r\n" +
          "\r\n"
      );

      const requestId = app.uuid();

      if (app.atHost.debug) console.log("Connection open");

      connectedCount++;

      const emit = (data) => {
        let message = JSON.stringify(data);

        while (message.length > 64000) {
          socket.write(encode(message.substring(0, 64000)));
          message = message.substring(64000);
        }
        socket.write(encode(message));
      };
      clients[requestId] = { id: requestId, emit };

      socket.on("data", (data) => {
        decode(data, (output) => {
          if (output === "{}") return;
          if (output[0] !== "{") return;

          try {
            const query = JSON.parse(output);
            query.id = requestId;

            app.connection.event(query.type, query).then(
              (result) =>
                (result.callbackClient || result.callbackid) && emit(result) // Remove callbackid in future
            );
          } catch (e) {
            // console.log(`Unparsed: ${output}`);
          }
        });
      });

      app.connection.event("connect", { id: requestId });

      socket.on("abort", () => {
        app.file.event("load", { id, request: { abort: true } });
      });
      socket.on("end", () => {
        connectedCount--;
        if (app.settings.debug) console.log("Client closed");
        delete clients[requestId];
        app.connection.event("disconnect", requestId);
      });
    });
  });

  app.connection.on("emit", (data) => {
    if (clients[data.id]) clients[data.id].emit(data);
  });

  app.connection.on("broadcast", (data) => {
    Object.values(clients)
      .filter((client) => client.id !== data.id)
      .forEach((client) => client.emit(data));
  });

  app.connection.on("count", (query) => {
    app.session.add(query);

    if (query.session.role !== "super") return;
    return { ...query, connectedCount };
  });
};
