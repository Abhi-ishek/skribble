import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    roomCode: {
      type: String,
      required: true,
      unique: true,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    hostId: {
      type: String,
      required: true,
    },
    settings: {
      maxPlayers: { type: Number, default: 8 },
      rounds: { type: Number, default: 3 },
      drawTime: { type: Number, default: 60 },
      wordCount: { type: Number, default: 3 },
      hints: { type: Number, default: 2 },
    },
    players: [
      {
        playerId: { type: String, required: true },
        name: { type: String, required: true },
        score: { type: Number, default: 0 },
        isHost: { type: Boolean, default: false },
      },
    ],
    status: {
      type: String,
      enum: ["lobby", "playing", "finished"],
      default: "lobby",
    },
  },
  { timestamps: true }
);

const Room = mongoose.model("Room", roomSchema);
export default Room;
