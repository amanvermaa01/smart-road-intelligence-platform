import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getEventSocket = () => {
  if (!socket) {
    socket = io(
      process.env.NEXT_PUBLIC_EVENT_WS_URL || "http://localhost:3002/events",
      {
        transports: ["websocket"],
        reconnection: true,
      }
    );
  }
  return socket;
};
