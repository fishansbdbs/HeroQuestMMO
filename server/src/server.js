import express from "express";
import cors from "cors";
import http from "node:http";
import { Server } from "socket.io";
import { WorldServer } from "./WorldServer.js";

const PORT = Number(process.env.PORT || 3000);
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";
const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  clientOrigin
]);

const app = express();
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) callback(null, true);
    else callback(new Error(`Origin not allowed: ${origin}`));
  }
}));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "heroquest-mmo-server" });
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [...allowedOrigins],
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"]
});

const world = new WorldServer(io);
io.on("connection", (socket) => world.attach(socket));

server.listen(PORT, "0.0.0.0", () => {
  console.log(`HeroQuest MMO server listening on ${PORT}`);
});
