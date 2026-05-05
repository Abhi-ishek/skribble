import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
// import { createContext } from "react";
const SocketContext = createContext();

const SERVER_URL =  https://skribble-ktax.onrender.com";
export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(https://skribble-ktax.onrender.com, {
      reconnection: true,
      reconnectionAttempts: 5,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
