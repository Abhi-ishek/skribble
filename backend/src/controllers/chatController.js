import { SERVER_EVENTS } from "../constants/events.js";

/**
 * Handles chat messages and word guesses.
 */
export const handleGuess = (socket, gameManager, { roomCode, text }) => {
  const room = gameManager.getRoom(roomCode);
  if (!room) return;

  const player = room.getPlayer(socket.id);
  if (!player) return;

  if (!text || text.trim().length === 0) return;

  const trimmedText = text.trim();

  if (room.isInGame() && room.game.phase === "drawing") {
    const result = room.game.handleGuess(socket.id, trimmedText);

    if (result.correct) {
      // Notify the room about the correct guess
      room.broadcast(SERVER_EVENTS.GUESS_RESULT, {
        correct: true,
        playerName: player.name,
        points: result.points,
        players: room.getPlayerList(),
      });

      // Special notification for the guesser
      socket.emit(SERVER_EVENTS.YOU_GUESSED, {
        word: room.game.currentWord,
        points: result.points,
      });
    } else {
      // If it's a wrong guess during drawing, broadcast as a guess type message
      room.broadcast(SERVER_EVENTS.CHAT_MESSAGE, {
        playerName: player.name,
        text: trimmedText,
        type: "guess",
        playerId: socket.id,
      });
    }
  } else {
    // If not in drawing phase, it's just normal chat
    room.broadcast(SERVER_EVENTS.CHAT_MESSAGE, {
      playerName: player.name,
      text: trimmedText,
      type: "chat",
      playerId: socket.id,
    });
  }
};
