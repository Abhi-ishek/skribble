import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext";

/**
 * Custom hook to manage socket event listeners.
 * @param {Object} handlers - Object where keys are event names and values are callback functions.
 * @returns {Object} The socket instance.
 */
const useSocket = (handlers = {}) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket) return;

    // Register all handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      socket.on(event, handler);
    });

    // Cleanup: remove all handlers on unmount or when handlers change
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
    };
  }, [socket, handlers]);

  return socket;
};

export default useSocket;
