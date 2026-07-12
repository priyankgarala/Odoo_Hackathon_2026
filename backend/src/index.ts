import app from "./app.js";
import { env } from "./config/env.js";
import { createServer } from "node:http";
import { initializeSocketServer } from "./lib/socket.js";

const server = createServer(app);
initializeSocketServer(server);

server.listen(env.port, () => {
  console.log(`TransitOps API running on http://localhost:${env.port}`);
});
