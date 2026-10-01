import net from "node:net";
import { randomUUID } from "node:crypto";

const port = 64656;
const maxFrame = 1024 * 1024;
const queueLimit = 8 * 1024 * 1024;
const maxPending = 1024;

// Both endpoints decode UTF-8 only after a complete length-prefixed frame arrives.
const commandParser = (socket, callback) => {
  const header = Buffer.alloc(4);
  let headerBytes = 0;
  let frame;
  let frameBytes = 0;
  let receivingBytes = 0;

  socket.on("data", (data) => {
    try {
      let offset = 0;
      while (offset < data.length && !socket.destroyed) {
        if (!frame) {
          const length = Math.min(4 - headerBytes, data.length - offset);
          data.copy(header, headerBytes, offset, offset + length);
          headerBytes += length;
          offset += length;
          if (headerBytes < 4) continue;
          const size = header.readUInt32BE();
          if (!size || size > maxFrame) throw new Error("Invalid worker frame size");
          frame = Buffer.allocUnsafe(size);
          headerBytes = 0;
        }

        const length = Math.min(frame.length - frameBytes, data.length - offset);
        data.copy(frame, frameBytes, offset, offset + length);
        frameBytes += length;
        offset += length;
        if (frameBytes < frame.length) continue;

        const message = JSON.parse(frame.toString("utf8"));
        if (!message || typeof message !== "object" || Array.isArray(message))
          throw new Error("Invalid worker message");
        const size = frame.length;
        frame = undefined;
        frameBytes = 0;
        receivingBytes += size;
        if (receivingBytes > queueLimit) throw new Error("Worker receive queue limit exceeded");

        // A handler can await another RPC on this socket, so replies must remain independent.
        Promise.resolve(callback(message))
          .catch((error) => socket.destroy(error))
          .finally(() => {
            receivingBytes -= size;
          });
      }
    } catch (error) {
      socket.destroy(error);
    }
  });

  return (data) => {
    if (socket.destroyed || socket.writableEnded) return false;
    try {
      const body = Buffer.from(JSON.stringify(data));
      if (body.length > maxFrame || socket.writableLength + body.length + 4 > queueLimit)
        throw new Error("Worker send queue limit exceeded");
      const frame = Buffer.allocUnsafe(body.length + 4);
      frame.writeUInt32BE(body.length);
      body.copy(frame, 4);
      // Node queues writes awaiting drain; the limit above bounds that queue.
      socket.write(frame);
      return true;
    } catch (error) {
      socket.destroy(error);
      return false;
    }
  };
};

const request = (socket, send, pending, message) =>
  new Promise((resolve, reject) => {
    if (socket.destroyed || socket.writableEnded || pending.size >= maxPending) {
      reject(new Error("Worker unavailable or pending call limit exceeded"));
      return;
    }
    const id = message.callback || message.id;
    const timer = setTimeout(() => {
      pending.delete(id);
      reject(new Error("Worker event timed out: " + message.event));
    }, 30000);
    timer.unref();
    pending.set(id, { resolve, reject, timer });
    if (!send(message)) {
      clearTimeout(timer);
      pending.delete(id);
      reject(new Error("Worker disconnected"));
    }
  });

const reply = (pending, id, data, error) => {
  const callback = pending.get(id);
  if (!callback) return; // Replies may arrive after a timeout.
  pending.delete(id);
  clearTimeout(callback.timer);
  if (error) callback.reject(new Error(error));
  else callback.resolve(data);
};

const disconnect = (pending) => {
  for (const callback of pending.values()) {
    clearTimeout(callback.timer);
    callback.reject(new Error("Worker disconnected"));
  }
  pending.clear();
};

export const server = (app) => {
  const sockets = new Set();
  let closed = false;
  const socketServer = net
    .createServer((socket) => {
      const pending = new Map();
      const subscriptions = new Map();
      socket.setNoDelay(true);
      sockets.add(socket);
      socket.on("error", (error) => console.error("[worker] connection error", error.message));
      socket.once("close", () => {
        sockets.delete(socket);
        for (const { event, callback } of subscriptions.values()) app.off(event, callback);
        subscriptions.clear();
        disconnect(pending);
      });

      const send = commandParser(socket, async ({ id, prio, off, on, event, data, callback, error }) => {
        if (callback) {
          reply(pending, callback, data, error);
        } else if (id) {
          try {
            send({ id, data: await app.event(event, data) });
          } catch (error) {
            send({ id, error: error.message });
          }
        } else if (on) {
          const callback = (data) => request(socket, send, pending, { on, event, data, callback: randomUUID() });
          subscriptions.set(on, { event, callback });
          app.on(event, callback, prio);
        } else if (off) {
          const subscription = subscriptions.get(off);
          if (subscription) app.off(subscription.event, subscription.callback);
          subscriptions.delete(off);
        } else if (event) {
          await app.event(event, data);
        }
      });
    })
    .listen(port, "127.0.0.1");

  const ready = new Promise((resolve, reject) => {
    socketServer.once("error", reject);
    socketServer.once("listening", () => {
      socketServer.off("error", reject);
      resolve();
    });
  });

  const close = () => {
    if (closed) return;
    closed = true;
    for (const socket of sockets) socket.destroy();
    socketServer.close(() => {});
  };
  socketServer.on("error", (error) => {
    console.error("[worker] listen error", error.message);
    close();
  });
  return { close, ready };
};

export const client = (ev = {}) => {
  const pending = new Map();
  const subscriptions = new Map();
  const client = net.connect({ port, host: "127.0.0.1" });
  client.setNoDelay(true);
  client.on("error", (error) => console.error("[worker] connection error", error.message));
  client.once("close", () => {
    disconnect(pending);
    subscriptions.clear();
    // Stop privileged listeners after their controlling server disconnects.
    process.exitCode = 1;
    setImmediate(() => process.exit());
  });

  const send = commandParser(client, async ({ id, on, data, callback, error }) => {
    if (callback) {
      try {
        send({ callback, data: await subscriptions.get(on).callback(data) });
      } catch (error) {
        send({ callback, error: error.message });
      }
    } else if (id) {
      reply(pending, id, data, error);
    }
  });

  return {
    ...ev,
    close: () => client.destroy(),
    notify: (event, data) => send({ event, data }),
    on: (event, callback, prio) => {
      if (typeof callback === "number") [callback, prio] = [prio, callback];
      const on = randomUUID();
      subscriptions.set(on, { event, callback });
      send({ on, prio, event });
    },
    event: (event, data) => request(client, send, pending, { id: randomUUID(), event, data }),
    off: (event, callback) => {
      for (const [off, subscription] of subscriptions) {
        if (subscription.event !== event || subscription.callback !== callback) continue;
        subscriptions.delete(off);
        send({ off });
        break;
      }
    },
  };
};

export default { server, client };
