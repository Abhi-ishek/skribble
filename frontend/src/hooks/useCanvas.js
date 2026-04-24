import { useRef, useEffect, useCallback } from "react";
import { useSocketContext } from "../context/SocketContext";
import { EVENTS, SERVER_EVENTS } from "../constants/events";
import { replayStrokes } from "../utils/canvasUtils";

export const useCanvas = ({ roomCode, isDrawer, phase }) => {
  const socket = useSocketContext();
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const currentColorRef = useRef("#000000");
  const currentSizeRef = useRef(5);
  const isEraserRef = useRef(false);

  const getCoords = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Scale coordinates to handle CSS scaling vs canvas resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const drawLocalSegment = useCallback((data) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    switch (data.type) {
      case "start":
        ctx.beginPath();
        ctx.moveTo(data.x, data.y);
        ctx.strokeStyle = data.color;
        ctx.lineWidth = data.size;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        break;
      case "move":
        ctx.lineTo(data.x, data.y);
        ctx.stroke();
        break;
      case "end":
        ctx.closePath();
        break;
      default:
        break;
    }
  }, []);

  // Event Handlers
  const handlePointerDown = useCallback((e) => {
    if (!isDrawer || phase !== "drawing") return;
    isDrawingRef.current = true;
    
    const { x, y } = getCoords(e, canvasRef.current);
    const color = isEraserRef.current ? "#ffffff" : currentColorRef.current;
    const size = currentSizeRef.current;

    const data = { type: "start", x, y, color, size };
    drawLocalSegment(data);
    socket.emit(EVENTS.DRAW_START, { roomCode, ...data });
  }, [isDrawer, phase, roomCode, socket, drawLocalSegment]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawingRef.current || !isDrawer || phase !== "drawing") return;
    
    const { x, y } = getCoords(e, canvasRef.current);
    const data = { type: "move", x, y };
    
    drawLocalSegment(data);
    socket.emit(EVENTS.DRAW_MOVE, { roomCode, ...data });
  }, [isDrawer, phase, roomCode, socket, drawLocalSegment]);

  const handlePointerUp = useCallback(() => {
    if (!isDrawingRef.current || !isDrawer || phase !== "drawing") return;
    isDrawingRef.current = false;
    
    drawLocalSegment({ type: "end" });
    socket.emit(EVENTS.DRAW_END, { roomCode });
  }, [isDrawer, phase, roomCode, socket, drawLocalSegment]);

  // Setup Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const onDrawData = (data) => drawLocalSegment(data);
    const onClear = () => {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };
    const onReset = ({ strokes }) => {
      if (canvasRef.current) replayStrokes(canvasRef.current, strokes);
    };

    socket.on(SERVER_EVENTS.DRAW_DATA, onDrawData);
    socket.on(SERVER_EVENTS.CANVAS_CLEARED, onClear);
    socket.on(SERVER_EVENTS.CANVAS_RESET, onReset);

    return () => {
      socket.off(SERVER_EVENTS.DRAW_DATA, onDrawData);
      socket.off(SERVER_EVENTS.CANVAS_CLEARED, onClear);
      socket.off(SERVER_EVENTS.CANVAS_RESET, onReset);
    };
  }, [socket, drawLocalSegment]);

  // Clear canvas on new round
  useEffect(() => {
    if (phase === "word_selection" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [phase]);

  // Attach/Detach Event Listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("mousemove", handlePointerMove);
    window.addEventListener("mouseup", handlePointerUp);
    
    canvas.addEventListener("touchstart", handlePointerDown, { passive: false });
    window.addEventListener("touchmove", handlePointerMove, { passive: false });
    window.addEventListener("touchend", handlePointerUp);

    return () => {
      canvas.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("mouseup", handlePointerUp);
      
      canvas.removeEventListener("touchstart", handlePointerDown);
      window.removeEventListener("touchmove", handlePointerMove);
      window.removeEventListener("touchend", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp]);

  // Controls
  const setColor = (color) => {
    currentColorRef.current = color;
    isEraserRef.current = false;
  };

  const setSize = (size) => {
    currentSizeRef.current = size;
  };

  const setEraser = (on) => {
    isEraserRef.current = on;
  };

  const clearCanvas = () => {
    if (!isDrawer) return;
    socket.emit(EVENTS.CANVAS_CLEAR, { roomCode });
  };

  const undoStroke = () => {
    if (!isDrawer) return;
    socket.emit(EVENTS.DRAW_UNDO, { roomCode });
  };

  return {
    canvasRef,
    setColor,
    setSize,
    setEraser,
    clearCanvas,
    undoStroke,
  };
};
