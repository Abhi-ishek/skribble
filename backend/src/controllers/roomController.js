import RoomModel from "../models/Room.model.js";
import { SERVER_EVENTS } from "../constants/events.js";

/**
 * REST: Fetches room info by code.
 */
export const getRoomByCode = async (req, res) => {
  const { code } = req.params;

  try {
    const room = await RoomModel.findOne({ roomCode: code });
    if (!room) {
      return res.status(404).json({ message: "Room not found." });
    }
    res.status(200).json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * REST: Fetches all public, non-playing rooms.
 */
export const getAllPublicRooms = async (req, res) => {
  try {
    const publicRooms = await RoomModel.find({ 
      isPrivate: false, 
      status: "lobby" 
    }).select("roomCode settings players hostId");
    
    res.status(200).json(publicRooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * SOCKET Logic for creating a room.
 */
export const createRoom = async (socket, gameManager, { playerName, settings, isPrivate }) => {
  if (!playerName || playerName.trim().length < 2) {
    return socket.emit("error", "Player name must be at least 2 characters.");
  }

  try {
    const room = await gameManager.createRoom(socket.id, playerName, settings, isPrivate);
    socket.join(room.roomCode);
    socket.emit(SERVER_EVENTS.ROOM_CREATED, room.toJSON());
  } catch (error) {
    console.error("Error creating room:", error);
    socket.emit(SERVER_EVENTS.ERROR, "Failed to create room.");
  }
};

/**
 * SOCKET Logic for joining a room.
 */
export const joinRoom = async (socket, gameManager, { roomCode, playerName }) => {
  if (!roomCode || !playerName || playerName.trim().length < 2) {
    return socket.emit(SERVER_EVENTS.ERROR, "Room code and player name (at least 2 chars) are required.");
  }

  const result = await gameManager.joinRoom(roomCode, socket.id, playerName);

  if (result.error) {
    return socket.emit(SERVER_EVENTS.ERROR, result.error);
  }

  const { room, player } = result;
  socket.join(room.roomCode);
  
  socket.emit(SERVER_EVENTS.ROOM_JOINED, room.toJSON());
  socket.to(room.roomCode).emit(SERVER_EVENTS.PLAYER_JOINED, { 
    player: player.toJSON(), 
    players: room.getPlayerList() 
  });
};

/**
 * SOCKET Logic for starting the game.
 */
export const startGame = async (socket, gameManager, { roomCode }) => {
  const room = gameManager.getRoom(roomCode);

  console.log(`[startGame] roomCode=${roomCode}, socket.id=${socket.id}, room.hostId=${room?.hostId}, players=${room?.players?.size}`);

  if (!room) {
    return socket.emit(SERVER_EVENTS.ERROR, "Room not found.");
  }

  if (room.hostId !== socket.id) {
    console.log(`[startGame] REJECTED: hostId=${room.hostId} !== socket.id=${socket.id}`);
    return socket.emit(SERVER_EVENTS.ERROR, "Only the host can start the game.");
  }

  if (room.players.size < 2) {
    console.log(`[startGame] REJECTED: only ${room.players.size} player(s), need 2`);
    return socket.emit(SERVER_EVENTS.ERROR, "At least 2 player are required to start.");
  }

  try {
    await room.startGame();
  } catch (error) {
    console.error("Error starting game:", error);
    socket.emit(SERVER_EVENTS.ERROR, "Failed to start game.");
  }
};

/**
 * SOCKET Logic for fetching public rooms.
 */
export const getPublicRooms = (socket, gameManager) => {
  socket.emit(SERVER_EVENTS.ROOM_UPDATED, gameManager.getPublicRooms());
};
