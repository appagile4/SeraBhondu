import { io, Socket } from "socket.io-client";

// Strictly read Socket URL from environment variable or derive from NEXT_PUBLIC_API_URL
const getSocketUrl = (): string => {
  if (process.env.NEXT_PUBLIC_SOCKET_URL) {
    return process.env.NEXT_PUBLIC_SOCKET_URL.replace(/\/+$/, "");
  }
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.serabondhu.net/api";
  return apiUrl.replace(/\/api\/?$/, "").replace(/\/+$/, "");
};

export const SOCKET_URL = getSocketUrl();

let socketInstance: Socket | null = null;

export const getSocket = (): Socket => {
  let token = "";
  if (typeof window !== "undefined") {
    token = localStorage.getItem("khojobangla_token") || "";
  }

  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: true,
      withCredentials: true,
      auth: {
        token,
      },
      query: {
        token,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      // Upon connection, verify auth if token available
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("khojobangla_token") || "" : "";
      if (currentToken) {
        socketInstance?.emit("authenticate", { token: currentToken });
      }
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("Socket connection warning:", err.message);
    });
  } else {
    // If token exists and socket is connected or not authenticated, ensure socket is authenticated
    if (token) {
      socketInstance.auth = { token };
      if (!socketInstance.connected) {
        socketInstance.connect();
      } else {
        socketInstance.emit("authenticate", { token });
      }
    }
  }

  return socketInstance;
};

export const updateSocketAuth = (token: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem("khojobangla_token", token);
  }

  if (socketInstance) {
    socketInstance.auth = { token };
    if (!socketInstance.connected) {
      socketInstance.connect();
    } else {
      socketInstance.emit("authenticate", { token });
    }
  } else {
    getSocket();
  }
};

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export default getSocket;
