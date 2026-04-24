import React from "react";
import PlayerCard from "./PlayerCard";
import "./Lobby.css";

const Lobby = ({ room, players, socketId, onStart }) => {
  const isHost = room.hostId === socketId;
  const inviteLink = `${window.location.origin}/room/${room.roomCode}`;

  const copyInvite = () => {
    navigator.clipboard.writeText(inviteLink);
  };

  const settings = room.settings || {};

  return (
    <div className="lobby-wrapper">
      <div className="glass-card lobby-panel">
        <header className="lobby-header">
          <div className="room-info-box">
            <span className="room-label">Room Code</span>
            <h1 className="room-code">{room.roomCode}</h1>
          </div>
          
          <div className="invite-box">
            <input type="text" value={inviteLink} readOnly />
            <button className="copy-btn" onClick={copyInvite}>Copy Link</button>
          </div>
        </header>

        <section className="settings-chips">
          <div className="chip">👥 {settings.maxPlayers} Max</div>
          <div className="chip">🔄 {settings.rounds} Rounds</div>
          <div className="chip">⏱️ {settings.drawTime}s</div>
          <div className="chip">📝 {settings.wordCount} Words</div>
          <div className="chip">💡 {settings.hints} Hints</div>
        </section>

        <div className="players-grid">
          {players.map((player) => (
            <PlayerCard 
              key={player.playerId} 
              player={player} 
              isYou={player.playerId === socketId} 
            />
          ))}
          
          {players.length < 4 && Array.from({ length: 4 - players.length }).map((_, i) => (
            <div key={`empty-${i}`} className="player-card-empty">
              <div className="avatar-placeholder">?</div>
              <span>Waiting...</span>
            </div>
          ))}
        </div>

        <footer className="lobby-footer">
          {isHost ? (
            <div className="host-actions">
              <p className="status-text">
                {players.length < 2 
                  ? "At least 2 players required to start" 
                  : "Ready to start the game!"}
              </p>
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200 ease-in-out" 
                onClick={onStart}
                disabled={players.length < 2}
              >
                Start Game
              </button>
            </div>
          ) : (
            <div className="waiting-indicator">
              <div className="loader-dots">
                <span></span><span></span><span></span>
              </div>
              <p>Waiting for host to start the game...</p>
            </div>
          )}
        </footer>
      </div>
    </div>
  );
};

export default Lobby;
