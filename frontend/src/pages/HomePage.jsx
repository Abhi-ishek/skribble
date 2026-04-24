import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useGame from "../hooks/useGame";
import "./HomePage.css";

const HomePage = () => {
  const [tab, setTab] = useState("join");
  const [playerName, setPlayerName] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [settings, setSettings] = useState({
    maxPlayers: 8,
    rounds: 3,
    drawTime: 60,
    wordCount: 3,
    hints: 2,
  });

  const { state, createRoom, joinRoom } = useGame();
  const navigate = useNavigate();

  // Navigation logic
  useEffect(() => {
    if (state.room) {
      navigate(`/room/${state.room}`);
    }
  }, [state.room, navigate]);

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim() || !roomCode.trim()) return;
    localStorage.setItem("scribble_player_name", playerName.trim());
    joinRoom(roomCode.trim(), playerName.trim());
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!playerName.trim()) return;
    localStorage.setItem("scribble_player_name", playerName.trim());
    createRoom(playerName.trim(), settings, isPrivate);
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: parseInt(value) }));
  };

  return (
    <div className="home-container">
      <div className="glass-card home-card">
        <header className="home-header">
          <h1 className="logo-text">Scribble<span>.io</span></h1>
          <p className="subtitle">Multiplayer Drawing Game</p>
        </header>

        <div className="tab-switcher">
          <button 
            className={`tab-btn ${tab === "join" ? "active" : ""}`}
            onClick={() => setTab("join")}
          >
            Join Room
          </button>
          <button 
            className={`tab-btn ${tab === "create" ? "active" : ""}`}
            onClick={() => setTab("create")}
          >
            Create Room
          </button>
        </div>

        {state.error && <div className="error-message">{state.error}</div>}

        {tab === "join" ? (
          <form className="home-form" onSubmit={handleJoinSubmit}>
            <div className="input-group">
              <label>Nickname</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                required
              />
            </div>
            <div className="input-group">
              <label>Room Code</label>
              <input
                type="text"
                placeholder="Enter passcode"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200 ease-in-out" disabled={!playerName || !roomCode}>
              Play Now
            </button>
          </form>
        ) : (
          <form className="home-form" onSubmit={handleCreateSubmit}>
            <div className="input-group">
              <label>FullName</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={15}
                required
              />
            </div>

            <div className="settings-grid">
              <div className="setting-item">
                <label>Players: {settings.maxPlayers}</label>
                <input
                  type="range"
                  min="2"
                  max="20"
                  value={settings.maxPlayers}
                  onChange={(e) => updateSetting("maxPlayers", e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Rounds: {settings.rounds}</label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={settings.rounds}
                  onChange={(e) => updateSetting("rounds", e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Draw Time: {settings.drawTime}s</label>
                <input
                  type="range"
                  min="15"
                  max="240"
                  step="15"
                  value={settings.drawTime}
                  onChange={(e) => updateSetting("drawTime", e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Words: {settings.wordCount}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={settings.wordCount}
                  onChange={(e) => updateSetting("wordCount", e.target.value)}
                />
              </div>
              <div className="setting-item">
                <label>Hints: {settings.hints}</label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={settings.hints}
                  onChange={(e) => updateSetting("hints", e.target.value)}
                />
              </div>
            </div>

            <div className="checkbox-group">
              <input
                type="checkbox"
                id="isPrivate"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <label htmlFor="isPrivate">Private Room (Invite Only)</label>
            </div>

            <button type="submit" className="bg-gray-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-200 ease-in-out" disabled={!playerName}>
              Create & Play
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default HomePage;
