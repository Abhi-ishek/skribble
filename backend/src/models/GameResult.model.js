import mongoose from "mongoose";

const gameResultSchema = new mongoose.Schema({
  roomCode: {
    type: String,
    required: true,
  },
  winner: {
    type: String,
    required: true,
  },
  leaderboard: [
    {
      name: { type: String, required: true },
      score: { type: Number, required: true },
    },
  ],
  playedAt: {
    type: Date,
    default: Date.now,
  },
});

const GameResult = mongoose.model("GameResult", gameResultSchema);
export default GameResult;
