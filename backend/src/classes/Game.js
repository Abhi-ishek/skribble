import { pickRandomWords, buildBlankHint, buildHint } from "../utils/helpers.js";
import GameResult from "../models/GameResult.model.js";
import { SERVER_EVENTS } from "../constants/events.js";

export class Game {
  constructor(io, roomId, players, settings) {
    this.io = io;
    this.roomId = roomId;
    this.players = players; // Array of Player instances
    this.settings = settings;

    this.phase = "lobby"; // lobby, word_selection, drawing, round_end, game_over
    this.currentRound = 0;
    this.drawerOrder = [];
    this.currentDrawerIndex = 0;
    this.currentWord = "";
    this.hintsRevealed = 0;
    this.strokeHistory = [];
    this.currentStroke = [];

    this.roundTimer = null;
    this.hintTimer = null;
  }

  /**
   * Starts the game.
   */
  async start() {
    this.players.forEach((p) => (p.score = 0));
    this.drawerOrder = this.players.map((p) => p.id);
    this.currentDrawerIndex = -1; // Will be incremented in nextRound
    await this.nextRound();
  }

  /**
   * Transitions to the next round or ends the game.
   */
  async nextRound() {
    this.clearTimers();
    this.currentRound++;

    if (this.currentRound > this.settings.rounds) {
      await this.endGame();
      return;
    }

    this.currentDrawerIndex = (this.currentRound - 1) % this.drawerOrder.length;
    const drawerId = this.drawerOrder[this.currentDrawerIndex];

    this.players.forEach((p) => p.resetRoundState());
    this.strokeHistory = [];
    this.currentStroke = [];
    this.currentWord = "";
    this.hintsRevealed = 0;

    this.phase = "word_selection";

    const wordOptions = await pickRandomWords(this.settings.wordCount);

    // Notify the drawer to pick a word
    const drawerSocket = this.io.sockets.sockets.get(drawerId);
    if (drawerSocket) {
      drawerSocket.emit(SERVER_EVENTS.ROUND_START, {
        round: this.currentRound,
        drawerId,
        wordOptions,
        phase: this.phase,
      });
    }

    // Notify others
    this.io.to(this.roomId).except(drawerId).emit(SERVER_EVENTS.ROUND_START, {
      round: this.currentRound,
      drawerId,
      phase: this.phase,
    });
  }

  /**
   * Starts the drawing phase once a word is selected.
   * @param {string} word 
   */
  startDrawing(word) {
    this.currentWord = word;
    this.phase = "drawing";

    const drawerId = this.drawerOrder[this.currentDrawerIndex];

    // Emit to drawer
    const drawerSocket = this.io.sockets.sockets.get(drawerId);
    if (drawerSocket) {
      drawerSocket.emit(SERVER_EVENTS.DRAWING_STARTED, {
        word: this.currentWord,
        drawTime: this.settings.drawTime,
      });
    }

    // Emit to others with blank hint
    this.io.to(this.roomId).except(drawerId).emit(SERVER_EVENTS.DRAWING_STARTED, {
      hint: buildBlankHint(this.currentWord),
      drawTime: this.settings.drawTime,
    });

    this.startRoundTimer();
    if (this.settings.hints) {
      this.startHintTimer();
    }
  }

  startRoundTimer() {
    if (this.roundTimer) clearTimeout(this.roundTimer);
    this.roundTimer = setTimeout(() => this.endRound(false), this.settings.drawTime * 1000);
  }

  startHintTimer() {
    if (this.hintTimer) clearInterval(this.hintTimer);
    
    // We want to reveal hints spaced out during the draw time.
    const interval = (this.settings.drawTime / (2 + 1)) * 1000;
    
    this.hintTimer = setInterval(() => {
      if (this.hintsRevealed >= 2) {
        clearInterval(this.hintTimer);
        return;
      }
      this.hintsRevealed++;
      const hint = buildHint(this.currentWord, this.hintsRevealed);
      const drawerId = this.drawerOrder[this.currentDrawerIndex];
      this.io.to(this.roomId).except(drawerId).emit(SERVER_EVENTS.HINT_UPDATE, { hint });
    }, interval);
  }

  /**
   * Handles a player's guess.
   * @param {string} playerId 
   * @param {string} text 
   * @returns {Object}
   */
  handleGuess(playerId, text) {
    const player = this.players.find((p) => p.id === playerId);
    const drawerId = this.drawerOrder[this.currentDrawerIndex];

    if (!player || playerId === drawerId || player.hasGuessedCorrectly) {
      return { correct: false };
    }

    if (text.trim().toLowerCase() === this.currentWord.toLowerCase()) {
      const previousCorrectCount = this.players.filter((p) => p.hasGuessedCorrectly).length;
      const points = Math.max(20, 100 - previousCorrectCount * 20);

      player.addScore(points);
      player.hasGuessedCorrectly = true;

      const drawer = this.players.find((p) => p.id === drawerId);
      if (drawer) drawer.addScore(25);

      const nonDrawers = this.players.filter((p) => p.id !== drawerId);
      const allGuessed = nonDrawers.every((p) => p.hasGuessedCorrectly);

      if (allGuessed) {
        this.endRound(true);
      }

      return { correct: true, points };
    }

    return { correct: false };
  }

  /**
   * Ends the current round.
   * @param {boolean} allGuessed 
   */
  async endRound(allGuessed) {
    if (this.phase !== "drawing") return;

    this.phase = "round_end";
    this.clearTimers();

    this.io.to(this.roomId).emit(SERVER_EVENTS.ROUND_END, {
      word: this.currentWord,
      scores: this.players.map((p) => p.toJSON()),
      allGuessed,
    });

    setTimeout(() => this.nextRound(), 5000);
  }

  /**
   * Ends the game and saves the result.
   */
  async endGame() {
    this.phase = "game_over";
    this.clearTimers();

    const leaderboard = [...this.players]
      .sort((a, b) => b.score - a.score)
      .map((p) => ({ name: p.name, score: p.score }));

    const winner = leaderboard[0]?.name || "None";

    try {
      const result = new GameResult({
        roomCode: this.roomId,
        winner,
        leaderboard,
      });
      await result.save();
    } catch (error) {
      console.error("Error saving game result:", error);
    }

    this.io.to(this.roomId).emit(SERVER_EVENTS.GAME_OVER, {
      winner,
      leaderboard,
    });
  }

  clearTimers() {
    if (this.roundTimer) clearTimeout(this.roundTimer);
    if (this.hintTimer) clearInterval(this.hintTimer);
  }

  // Stroke methods
  addStroke(stroke) {
    this.currentStroke.push(stroke);
    if (stroke.type === "end") {
      this.strokeHistory.push([...this.currentStroke]);
      this.currentStroke = [];
    }
  }

  undoStroke() {
    this.strokeHistory.pop();
  }

  clearCanvas() {
    this.strokeHistory = [];
    this.currentStroke = [];
  }

  getStrokeHistory() {
    return this.strokeHistory;
  }

  getCurrentDrawerId() {
    return this.drawerOrder[this.currentDrawerIndex];
  }
}
