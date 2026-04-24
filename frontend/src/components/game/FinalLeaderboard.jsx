import React from "react";
import "./FinalLeaderboard.css";

const FinalLeaderboard = ({ leaderboard, winner, onPlayAgain, onHome, isHost }) => {
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className="final-leaderboard-overlay">
      <div className="glass-card result-panel">
        <header className="result-header">
          <div className="trophy-reveal">🏆</div>
          <h1 className="winner-name">{winner} Wins!</h1>
          <p className="game-over-text">Game Over</p>
        </header>

        <div className="podium-list">
          {leaderboard.map((player, index) => (
            <div 
              key={index} 
              className={`podium-row rank-${index + 1}`}
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <span className="medal">
                {index < 3 ? medals[index] : `#${index + 1}`}
              </span>
              <span className="player-name">{player.name}</span>
              <span className="final-score">{player.score} pts</span>
            </div>
          ))}
        </div>

        <footer className="result-footer">
          {isHost && (
            <button className="btn btn-primary play-again-btn" onClick={onPlayAgain}>
              Play Again
            </button>
          )}
          <button className="btn btn-secondary home-btn" onClick={onHome}>
            Back to Home
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FinalLeaderboard;
