/* eslint-disable no-bitwise */
import { createHash } from "node:crypto";

export default async (app) => {
  app.connection = app.addeventhandler({}, ["emit", "broadcast", "count"]);

  if (!app.settings.client.domain) return;

  await app.require("./httpsfallback");

  const clients = {};
  let connectedCount = 0;

  const parseWebSocketFrames = (connectionState, onTextMessage, sendFrame) => {
    let { buffer, currentMessageFragments, currentMessageOpcode } =
      connectionState;

    while (buffer.length >= 2) {
      const firstByte = buffer.readUInt8(0);
      const fin = (firstByte & 0x80) !== 0; // FIN bit
      const opcode = firstByte & 0x0f; // Opcode (last 4 bits)

      const secondByte = buffer.readUInt8(1);
      const masked = (secondByte & 0x80) !== 0; // Mask bit
      let payloadLength = secondByte & 0x7f; // Payload length (last 7 bits)

      let headerLength = 2; // Initial header length (first two bytes)

      // Determine actual payload length
      if (payloadLength === 126) {
        if (buffer.length < 4) break; // Need more data for 16-bit length
        payloadLength = buffer.readUInt16BE(2);
        headerLength += 2;
      } else if (payloadLength === 127) {
        if (buffer.length < 10) break; // Need more data for 64-bit length
        const high = buffer.readUInt32BE(2);
        const low = buffer.readUInt32BE(6);
        if (high !== 0) {
          console.warn(
            "Received very large payload length, potentially unsupported.",
          );
        }
        payloadLength = low; // Assuming high bits are 0 for simplicity
        headerLength += 8;
      }

      if (masked) headerLength += 4;

      // Check if we have enough data for the full header and payload
      if (buffer.length < headerLength + payloadLength) {
        break; // Not enough data yet, wait for more
      }

      // Extract masking key and payload data
      let maskingKey;
      if (masked) maskingKey = buffer.subarray(headerLength - 4, headerLength);

      const payloadData = buffer.subarray(
        headerLength,
        headerLength + payloadLength,
      );

      // Unmask the payload data if masked (server receives masked client data)
      if (masked)
        for (let i = 0; i < payloadData.length; i++) {
          // eslint-disable-next-line operator-assignment
          payloadData[i] = payloadData[i] ^ maskingKey[i % 4];
        }

      // Process the frame based on opcode and fragmentation state
      if (opcode === 0x0) {
        // Continuation Frame
        if (!currentMessageFragments) {
          console.warn(
            "Received continuation frame without initial frame. Protocol error.",
          );
          sendFrame(Buffer.from([0x03, 0xea]), 0x8, false); // Close frame with 1002 protocol error
          connectionState.shouldClose = true; // Signal outer scope to close
          break;
        }
        currentMessageFragments = Buffer.concat([
          currentMessageFragments,
          payloadData,
        ]);
        if (fin) {
          // End of fragmented message
          if (currentMessageOpcode === 0x1) {
            // Text
            onTextMessage(currentMessageFragments.toString("utf8"));
          } else if (currentMessageOpcode === 0x2) {
            // Binary
            // onBinaryMessage(currentMessageFragments);
          }
          // Reset fragmentation state
          currentMessageFragments = null;
          currentMessageOpcode = null;
        }
      } else if (opcode === 0x1 || opcode === 0x2) {
        // Text or Binary Frame
        if (currentMessageFragments) {
          console.warn(
            "Received new message frame while fragmentation is active. Protocol error.",
          );
          sendFrame(Buffer.from([0x03, 0xea]), 0x8, false); // Close frame with 1002 protocol error
          connectionState.shouldClose = true;
          break;
        }

        if (fin) {
          // Non-fragmented message
          if (opcode === 0x1) {
            onTextMessage(payloadData.toString("utf8"));
          } else if (opcode === 0x2) {
            // onBinaryMessage(payloadData);
          }
        } else {
          // Start of a fragmented message
          currentMessageFragments = payloadData;
          currentMessageOpcode = opcode;
        }
      } else if (opcode === 0x8) {
        // Connection Close Frame
        // console.log("Received close frame. Sending acknowledgement.");
        // sendFrame(Buffer.alloc(0), 0x8, false); // Acknowledge close
        connectionState.shouldClose = true; // Signal outer scope to close
        break; // Stop processing further frames
      } else if (opcode === 0x9) {
        // Ping Frame
        console.log("Received Ping frame. Sending Pong.");
        sendFrame(payloadData, 0xa, false); // Respond with Pong
      } else if (opcode === 0xa) {
        // Pong Frame
        console.log("Received Pong frame.");
      } else {
        // Unknown opcode (non-control)
        console.warn(`Unknown opcode: ${opcode}. Sending protocol error.`);
        sendFrame(Buffer.from([0x03, 0xea]), 0x8, false); // Close frame with 1002 protocol error
        connectionState.shouldClose = true;
        break;
      }

      // Remove processed frame data from the buffer
      buffer = buffer.subarray(headerLength + payloadLength);
    }

    // Update the connectionState object that was passed in
    connectionState.buffer = buffer;
    connectionState.currentMessageFragments = currentMessageFragments;
    connectionState.currentMessageOpcode = currentMessageOpcode;

    return connectionState; // Return the updated state
  };

  const sendWebSocketFrame = (socket, payload, opcode, mask) => {
    if (mask) console.log("Masssssk!!!");
    const payloadBuffer =
      typeof payload === "string" ? Buffer.from(payload, "utf8") : payload;
    const payloadLength = payloadBuffer.length;

    // First byte: FIN (1) | RSV (000) | Opcode (4 bits)
    const firstByte = 0x80 | opcode; // FIN is always set for non-fragmented messages

    // Second byte: Mask (1) | Payload Length (7 bits)
    let secondByte = mask ? 0x80 : 0x00;
    let header = Buffer.alloc(2);

    if (payloadLength <= 125) {
      secondByte |= payloadLength;
      header.writeUInt8(firstByte, 0);
      header.writeUInt8(secondByte, 1);
    } else if (payloadLength <= 0xffff) {
      // 16-bit length
      secondByte |= 126;
      header = Buffer.alloc(4);
      header.writeUInt8(firstByte, 0);
      header.writeUInt8(secondByte, 1);
      header.writeUInt16BE(payloadLength, 2);
    } else {
      // 64-bit length
      secondByte |= 127;
      header = Buffer.alloc(10);
      header.writeUInt8(firstByte, 0);
      header.writeUInt8(secondByte, 1);
      header.writeUInt32BE(0, 2); // Most significant 32 bits (usually 0)
      header.writeUInt32BE(payloadLength, 6); // Least significant 32 bits
    }

    let fullFrame = Buffer.concat([header]);

    if (mask) {
      // Servers typically don't mask data sent to clients.
      // This 'mask' parameter would primarily be for if you were implementing
      // a client-side websocket from scratch.
      const maskingKey = Buffer.alloc(4);
      for (let i = 0; i < 4; i++) {
        maskingKey[i] = Math.floor(Math.random() * 256); // Random mask
      }
      fullFrame = Buffer.concat([fullFrame, maskingKey]);

      const maskedPayload = Buffer.alloc(payloadLength);
      for (let i = 0; i < payloadLength; i++) {
        maskedPayload[i] = payloadBuffer[i] ^ maskingKey[i % 4];
      }
      fullFrame = Buffer.concat([fullFrame, maskedPayload]);
    } else {
      fullFrame = Buffer.concat([fullFrame, payloadBuffer]);
    }

    if (socket.readyState === "open") socket.write(fullFrame);
  };

  app.on("start", () => {
    app.file.on("socket", ({ id, req, socket }) => {
      const key = req.headers["sec-websocket-key"];
      const sha1 = createHash("sha1");
      sha1.update(`${key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`);
      const acceptKey = sha1.digest("base64");
      if (!socket.writable) return;

      socket.write(
        // eslint-disable-next-line prefer-template
        "HTTP/1.1 101 Web Socket Protocol Handshake\r\n" +
          "Upgrade: WebSocket\r\n" +
          "Connection: Upgrade\r\n" +
          "Sec-WebSocket-Accept: " +
          acceptKey +
          "\r\n" +
          "\r\n",
      );

      const requestId = app.uuid();

      if (app.atHost.debug) console.log("Connection open");

      connectedCount++;

      clients[requestId] = {
        id: requestId,
        emit: (data) => sendWebSocketFrame(socket, JSON.stringify(data), 0x1),
      };

      const connectionState = {
        buffer: Buffer.alloc(0),
        currentMessageFragments: null, // Stores fragments of a multi-frame message
        currentMessageOpcode: null, // Stores opcode of the first fragment (text or binary)
        shouldClose: false, // Flag to signal closure from parseFrames
      };
      socket.on("data", (wsData) => {
        connectionState.buffer = Buffer.concat([
          connectionState.buffer,
          wsData,
        ]);

        // Call the parser with the connection's state
        parseWebSocketFrames(
          connectionState,
          async (output) => {
            if (output === "{}") return;

            let query;
            try {
              query = JSON.parse(output);
              query.id = requestId;
            } catch (e) {
              const part = output.substring(0, 50);
              console.log(`Unparsed: ${output.length} ${part}`);
              return;
            }
            const result = await app.connection.event(query.type, query);
            // Remove callbackid in future
            if (result.callbackClient || result.callbackid)
              sendWebSocketFrame(socket, JSON.stringify(result), 0x1);
          },
          (payload, opcode, mask) =>
            sendWebSocketFrame(socket, payload, opcode, mask),
        );

        // If parseWebSocketFrames signaled to close, do it here
        if (connectionState.shouldClose) socket.end();
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
    else return { ...data, missing: true };
  });

  app.connection.on("broadcast", (data) => {
    Object.values(clients)
      .filter((client) => client.id !== data.id)
      .forEach((client) => client.emit(data));
  });

  app.connection.on("count", (query) => {
    app.session.add(query);

    if (!["config", "super"].includes(query.session.role)) return;
    return { ...query, connectedCount };
  });
};
