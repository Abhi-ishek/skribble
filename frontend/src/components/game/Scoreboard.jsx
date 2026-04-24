import React, { useMemo } from "react";
import "./Scoreboard.css";

const Scoreboard = ({ players, socketId, drawerId }) => {
  // Sort players by score descending
  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score);
  }, [players]);

  return (
    <div className="scoreboard-sidebar">
      <div className="scoreboard-header">
        <h3>Scoreboard</h3>
      </div>
      <div className="players-list">
        {sortedPlayers.map((player, index) => {
          const isYou = player.playerId === socketId;
          const isDrawer = player.playerId === drawerId;

          return (
            <div 
              key={player.playerId} 
              className={`scoreboard-row ${isYou ? 'is-you' : ''} ${player.hasGuessedCorrectly ? 'guessed' : ''}`}
            >
              <div className="rank">#{index + 1}</div>
              <div className="player-meta">
                <span className="name">
                  {player.name} {isDrawer && "✏️"}
                </span>
                <span className="points">{player.score} pts</span>
              </div>
              <div className="status-icons">
                {player.hasGuessedCorrectly && <span className="correct-check">✅</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Scoreboard;
