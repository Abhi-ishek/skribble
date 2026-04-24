import { Room } from "./Room.js";
import { Player } from "./Player.js";
import { generateRoomCode } from "../utils/helpers.js";
import RoomModel from "../models/Room.model.js";
import { SERVER_EVENTS } from "../constants/events.js";

export class GameManager {
  constructor(io = null) {
    this.io = io;
    this.rooms = new Map(); // roomCode → Room
  }

  /**
   * Initializes the manager with the socket.io instance.
   * @param {Object} io 
   */
  init(io) {
    this.io = io;
  }

  /**
   * Creates a new room and saves it to MongoDB.
   */
  async createRoom(hostId, hostName, settings, isPrivate = false) {
    let roomCode = generateRoomCode();
    
    while (this.rooms.has(roomCode)) {
      roomCode = generateRoomCode();
    }

    const host = new Player(hostId, hostName, true);
    const room = new Room(this.io, roomCode, hostId, settings, isPrivate);
    room.addPlayer(host);

    this.rooms.set(roomCode, room);

    // Save to MongoDB
    try {
      const roomDoc = new RoomModel({
        roomCode,
        isPrivate,
        hostId,
        settings,
        players: [{ playerId: hostId, name: hostName, isHost: true }],
        status: "lobby",
      });
      await roomDoc.save();
    } catch (error) {
      console.error("Error saving room to DB:", error);
    }

    return room;
  }

  /**
   * Adds a player to an existing room.
   */
  async joinRoom(roomCode, playerId, playerName) {
    let room = this.rooms.get(roomCode);

    // If room not in memory, try to load from DB
    if (!room) {
      try {
        const roomDoc = await RoomModel.findOne({ roomCode }).lean();
        if (roomDoc) {
          // Reconstruct Room from DB
          room = new Room(this.io, roomCode, roomDoc.hostId, roomDoc.settings, roomDoc.isPrivate);
          roomDoc.players.forEach(p => {
            // We can't perfectly reconstruct Player instances without active sockets, 
            // but we can at least restore the room structure.
            // Note: Since players are keyed by socketId, and they are re-joining,
            // we'll let the join process handle adding them back correctly.
          });
          this.rooms.set(roomCode, room);
        }
      } catch (error) {
        console.error("Error reloading room from DB:", error);
      }
    }

    if (!room) {
      return { error: "Room not found." };
    }

    if (room.isInGame()) {
      return { error: "Game already in progress." };
    }

    if (room.players.size >= room.settings.maxPlayers) {
      return { error: "Room is full." };
    }

    const player = new Player(playerId, playerName, false);
    room.addPlayer(player);

    // Update MongoDB
    try {
      await RoomModel.findOneAndUpdate(
        { roomCode },
        { 
          $push: { 
            players: { playerId, name: playerName, isHost: false } 
          } 
        }
      );
    } catch (error) {
      console.error("Error updating room in DB:", error);
    }

    return { room, player };
  }

  /**
   * Handles player disconnection.
   */
  async handleDisconnect(socketId) {
    for (const [roomCode, room] of this.rooms.entries()) {
      if (room.players.has(socketId)) {
        room.removePlayer(socketId);
        
        room.broadcast(SERVER_EVENTS.PLAYER_LEFT, { playerId: socketId });
        room.broadcast(SERVER_EVENTS.ROOM_UPDATED, room.toJSON());

        if (room.isEmpty()) {
          this.rooms.delete(roomCode);
          try {
            await RoomModel.findOneAndDelete({ roomCode });
          } catch (error) {
            console.error("Error deleting room from DB:", error);
          }
        } else {
          try {
            // Update host if changed or just remove player
            await RoomModel.findOneAndUpdate(
              { roomCode },
              { 
                $pull: { players: { playerId: socketId } },
                hostId: room.hostId // sync host in case it changed
              }
            );
          } catch (error) {
            console.error("Error removing player from DB:", error);
          }
        }
        return roomCode;
      }
    }
    return null;
  }

  getRoom(roomCode) {
    return this.rooms.get(roomCode);
  }

  /**
   * Returns a list of public rooms.
   */
  getPublicRooms() {
    return Array.from(this.rooms.values())
      .filter((room) => !room.isPrivate && !room.isInGame())
      .map((room) => room.toJSON());
  }
}
