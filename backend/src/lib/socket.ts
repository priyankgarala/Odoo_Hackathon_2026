import { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import { env } from "../config/env.js";

type SocketUser = { id: string; role: Role };
let io: Server | undefined;

function getCookie(cookieHeader: string | undefined, name: string) {
  return cookieHeader?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1);
}

export function initializeSocketServer(server: HttpServer) {
  io = new Server(server, { cors: { origin: env.frontendUrl, credentials: true } });
  io.use((socket, next) => {
    const token = getCookie(socket.handshake.headers.cookie, "token");
    if (!token) return next(new Error("Authentication required"));
    try {
      const user = jwt.verify(decodeURIComponent(token), env.jwtSecret) as SocketUser;
      socket.data.user = user;
      next();
    } catch { next(new Error("Invalid or expired session")); }
  });
  io.on("connection", (socket) => {
    const user = socket.data.user as SocketUser;
    socket.join(`user:${user.id}`);
    socket.join(`role:${user.role}`);

    socket.on("driver:location:update", (payload: { tripId: string; location: string }) => {
      // Broadcast to all fleet managers (or globally to the namespace)
      io?.emit("driver:location:updated", {
        driverId: user.id,
        tripId: payload.tripId,
        location: payload.location,
        updatedAt: new Date().toISOString()
      });
    });
  });
  return io;
}

export function emitOperationsUpdate(event: string, payload: Record<string, unknown>) {
  io?.emit("operations:update", { event, payload, occurredAt: new Date().toISOString() });
}
