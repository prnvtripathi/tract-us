import "dotenv/config";
import cors from "cors";
import express from "express";
import { createServer } from "http";
import { toNodeHandler } from "better-auth/node";

import { auth } from "./lib/auth";
import { default as contractsRouter } from "./routes/contracts";
import { initSocket } from "./lib/socket";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.all("/api/auth{/*path}", toNodeHandler(auth));

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/api/healthz", (_req, res) => {
  console.log("Health check OK");
  res.status(200).json({ status: "ok" });
});

app.use("/api/contracts", contractsRouter);

const port = process.env.PORT || 4000;

const server = createServer(app);
initSocket(server);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
