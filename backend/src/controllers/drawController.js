import { SERVER_EVENTS } from "../constants/events.js";

/**
 * Helper to validate if the socket is the current drawer and game is in drawing phase.
 */
const getGameAsDrawer = (socket, gameManager, roomCode) => {
  const room = gameManager.getRoom(roomCode);
  if (!room || !room.game) return null;

  const { game } = room;
  if (socket.id !== game.getCurrentDrawerId()) return null;
  if (game.phase !== "drawing") return null;

  return { room, game };
};

/**
 * Handles the start of a drawing stroke.
 */
export const drawStart = (socket, gameManager, { roomCode, x, y, color, size }) => {
  const context = getGameAsDrawer(socket, gameManager, roomCode);
  if (!context) return;

  const { game } = context;
  const stroke = { type: "start", x, y, color, size };
  game.addStroke(stroke);

  socket.to(roomCode).emit(SERVER_EVENTS.DRAW_DATA, stroke);
};

/**
 * Handles continuous drawing movement.
 */
export const drawMove = (socket, gameManager, { roomCode, x, y }) => {
  const context = getGameAsDrawer(socket, gameManager, roomCode);
  if (!context) return;

  const { game } = context;
  const stroke = { type: "move", x, y };
  game.addStroke(stroke);

  socket.to(roomCode).emit(SERVER_EVENTS.DRAW_DATA, stroke);
};

/**
 * Handles the end of a drawing stroke.
 */
export const drawEnd = (socket, gameManager, { roomCode }) => {
  const context = getGameAsDrawer(socket, gameManager, roomCode);
  if (!context) return;

  const { game } = context;
  game.addStroke({ type: "end" });

  socket.to(roomCode).emit(SERVER_EVENTS.DRAW_DATA, { type: "end" });
};

/**
 * Clears the entire canvas.
 */
export const canvasClear = (socket, gameManager, { roomCode }) => {
  const context = getGameAsDrawer(socket, gameManager, roomCode);
  if (!context) return;

  const { room, game } = context;
  game.clearCanvas();
  room.broadcast(SERVER_EVENTS.CANVAS_CLEARED, {});
};

/**
 * Undoes the last complete stroke.
 */
export const drawUndo = (socket, gameManager, { roomCode }) => {
  const context = getGameAsDrawer(socket, gameManager, roomCode);
  if (!context) return;

  const { room, game } = context;
  game.undoStroke();
  room.broadcast(SERVER_EVENTS.CANVAS_RESET, { strokes: game.getStrokeHistory() });
};

/**
 * Synchronizes the canvas state for the requesting client.
 */
export const requestCanvasSync = (socket, gameManager, { roomCode }) => {
  const room = gameManager.getRoom(roomCode);
  if (!room || !room.game) return;

  socket.emit(SERVER_EVENTS.CANVAS_RESET, { strokes: room.game.getStrokeHistory() });
};
