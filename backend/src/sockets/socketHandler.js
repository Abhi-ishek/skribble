import * as roomController from "../controllers/roomController.js";
import * as gameController from "../controllers/gameController.js";
import * as drawController from "../controllers/drawController.js";
import * as chatController from "../controllers/chatController.js";
import { EVENTS } from "../constants/events.js";

export default function socketHandler(io, gameManager) {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    // Room events
    socket.on(EVENTS.CREATE_ROOM, (data) => roomController.createRoom(socket, gameManager, data));
    socket.on(EVENTS.JOIN_ROOM, (data) => roomController.joinRoom(socket, gameManager, data));
    socket.on(EVENTS.START_GAME, (data) => roomController.startGame(socket, gameManager, data));
    socket.on(EVENTS.GET_PUBLIC_ROOMS, () => roomController.getPublicRooms(socket, gameManager));

    // Game events
    socket.on(EVENTS.WORD_CHOSEN, (data) => gameController.wordChosen(socket, gameManager, data));

    // Draw events
    socket.on(EVENTS.DRAW_START, (data) => drawController.drawStart(socket, gameManager, data));
    socket.on(EVENTS.DRAW_MOVE, (data) => drawController.drawMove(socket, gameManager, data));
    socket.on(EVENTS.DRAW_END, (data) => drawController.drawEnd(socket, gameManager, data));
    socket.on(EVENTS.CANVAS_CLEAR, (data) => drawController.canvasClear(socket, gameManager, data));
    socket.on(EVENTS.DRAW_UNDO, (data) => drawController.drawUndo(socket, gameManager, data));
    socket.on(EVENTS.REQUEST_CANVAS_SYNC, (data) => drawController.requestCanvasSync(socket, gameManager, data));

    // Chat / Guess event
    socket.on(EVENTS.GUESS, (data) => chatController.handleGuess(socket, gameManager, data));

    // Disconnect
    socket.on(EVENTS.DISCONNECT, () => {
      console.log(`User disconnected: ${socket.id}`);
      gameManager.handleDisconnect(socket.id);
    });
  });
}
