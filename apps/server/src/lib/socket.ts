import { Server } from "socket.io";
import { Server as HTTPServer } from "http";

let io: Server | null = null;

export const initSocket = (server: HTTPServer) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || "*",
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

export const notifyContractFinalized = (id: string) => {
  if (io) {
    console.log("Notifying clients about finalized contract:", id);
    io.emit("contract:finalized", { id });
  }
};

export const aiNotify = (event: string, data: any) => {
  if (io) {
    console.log(`Emitting event ${event} with data:`, data);
    io.emit(event, data);
  }
};
