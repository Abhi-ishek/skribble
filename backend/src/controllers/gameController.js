import { SERVER_EVENTS } from "../constants/events.js";

/**
 * Handles the word selection logic.
 */
export const wordChosen = (socket, gameManager, { roomCode, word }) => {
  const room = gameManager.getRoom(roomCode);
  if (!room || !room.game) return;

  const { game } = room;

  // Verify it's the drawer's turn to pick
  if (socket.id !== game.getCurrentDrawerId()) {
    return socket.emit(SERVER_EVENTS.ERROR, "It's not your turn to choose a word.");
  }

  // Verify the game is in the correct phase
  if (game.phase !== "word_selection") {
    return socket.emit(SERVER_EVENTS.ERROR, "Word selection is not allowed at this time.");
  }

  game.startDrawing(word);
};
