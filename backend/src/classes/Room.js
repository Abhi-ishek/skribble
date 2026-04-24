import { Game } from "./Game.js";
import RoomModel from "../models/Room.model.js";

export class Room {
  constructor(io, roomCode, hostId, settings, isPrivate = false) {
    this.io = io;
    this.roomCode = roomCode;
    this.hostId = hostId;
    this.settings = settings;
    this.isPrivate = isPrivate;

    this.players = new Map(); // Map<socketId, Player>
    this.game = null;
  }

  /**
   * Adds a player to the room.
   * @param {Player} player 
   * @returns {boolean}
   */
  addPlayer(player) {
    if (this.players.size >= this.settings.maxPlayers) {
      return false;
    }
    this.players.set(player.id, player);
    return true;
  }

  /**
   * Removes a player and reassigns host if necessary.
   * @param {string} id 
   */
  removePlayer(id) {
    const playerToRemove = this.players.get(id);
    if (!playerToRemove) return;

    this.players.delete(id);

    // If host left, assign new host from remaining
    if (playerToRemove.isHost && this.players.size > 0) {
      const nextPlayer = this.players.values().next().value;
      if (nextPlayer) {
        nextPlayer.isHost = true;
        this.hostId = nextPlayer.id;
      }
    }
  }

  getPlayer(id) {
    return this.players.get(id);
  }

  getPlayerList() {
    return Array.from(this.players.values()).map((p) => p.toJSON());
  }

  isEmpty() {
    return this.players.size === 0;
  }

  /**
   * Starts the game for the room.
   */
  async startGame() {
    this.game = new Game(this.io, this.roomCode, Array.from(this.players.values()), this.settings);
    
    // Update MongoDB status
    try {
      await RoomModel.findOneAndUpdate(
        { roomCode: this.roomCode },
        { status: "playing" }
      );
    } catch (error) {
      console.error("Error updating room status in DB:", error);
    }

    await this.game.start();
  }

  broadcast(event, data) {
    this.io.to(this.roomCode).emit(event, data);
  }

  broadcastExcept(id, event, data) {
    this.io.to(this.roomCode).except(id).emit(event, data);
  }

  isInGame() {
    return (
      this.game &&
      this.game.phase !== "lobby" &&
      this.game.phase !== "game_over"
    );
  }

  /**
   * Returns a plain object representation of the room.
   * @returns {Object}
   */
  toJSON() {
    return {
      roomCode: this.roomCode,
      isPrivate: this.isPrivate,
      hostId: this.hostId,
      settings: this.settings,
      players: this.getPlayerList(),
      phase: this.game ? this.game.phase : "lobby",
      status: this.game ? this.game.phase : "lobby", // Syncing status with game phase
    };
  }
}