"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:4000";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setConnected] = useState(false);

  useEffect(() => {
    const s = io(SOCKET_URL);

    s.on("connect", () => {
      setConnected(true);
    });

    s.on("disconnect", () => {
      setConnected(false);
    });

    s.on("contract:finalized", (payload) => {
      toast.success(`Contract ${payload.contractId} has been finalized`);
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return { socket, isConnected };
};
