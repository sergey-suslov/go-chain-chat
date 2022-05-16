import { useCallback, useEffect, useState } from "react";
import useWebSocket, { ReadyState } from "react-use-websocket";
import { io, Socket } from "socket.io-client";

interface ServerToClientEvents {
  message: (message: string) => void;
}

interface ClientToServerEvents {
  message: (message: string) => void;
}

export const useSocket = (onMessage: (message: string) => void) => {
  const {
    sendMessage: send,
    lastMessage,
    readyState,
  } = useWebSocket("ws://localhost:8080/ws");
  useEffect(() => {
    if (lastMessage) {
      onMessage(lastMessage?.data);
    }
  }, [lastMessage, onMessage]);

  const isConnected = readyState === ReadyState.OPEN;
  const sendMessage = useCallback(
    (message: string) => {
      if (isConnected) {
        send(message);
      }
    },
    [isConnected, send]
  );

  return { sendMessage, isConnected };
};

//  export const useSocket = (onMessage: (message: string) => void) => {
//    const [socket, setSocket] = useState<Socket | null>(null);
//    useEffect(() => {
//      const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io({
//        path: "/ws",
//        port: 8080,
//      });
//      newSocket.on("connect", () => {
//        setSocket(newSocket);
//      });
//      newSocket.on("disconnect", () => {
//        setSocket(null);
//      });
//      newSocket.on("message", (message) => onMessage(message));
//      return () => {
//        newSocket.disconnect();
//        setSocket(null);
//      };
//    }, [onMessage]);
//
//    const isConnected = socket && socket.connected;
//    const sendMessage = useCallback(
//      (message: string) => {
//        if (isConnected) {
//          socket.emit("message", message);
//        }
//      },
//      [socket, isConnected]
//    );
//
//    return { socket, sendMessage, isConnected };
//  };
