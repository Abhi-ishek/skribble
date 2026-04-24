export class Player {
  constructor(id, name, isHost = false) {
    this.id = id;
    this.name = name;
    this.score = 0;
    this.isHost = isHost;
    this.hasGuessedCorrectly = false;
  }

  /**
   * Adds points to the player's total score.
   * @param {number} points 
   */
  addScore(points) {
    this.score += points;
  }

  /**
   * Resets the player's guessing state for a new round.
   */
  resetRoundState() {
    this.hasGuessedCorrectly = false;
  }

  /**
   * Returns a plain object representation of the player.
   * @returns {Object}
   */
  toJSON() {
    return {
      playerId: this.id,
      name: this.name,
      score: this.score,
      isHost: this.isHost,
      hasGuessedCorrectly: this.hasGuessedCorrectly,
    };
  }
}
