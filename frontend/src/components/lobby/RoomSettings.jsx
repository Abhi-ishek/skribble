import React from "react";
import "./RoomSettings.css";

const RoomSettings = ({ settings, onChange, disabled }) => {
  const handleSettingChange = (key, value) => {
    onChange(key, parseInt(value));
  };

  return (
    <div className={`room-settings-container ${disabled ? "is-disabled" : ""}`}>
      <div className="setting-control">
        <div className="setting-header">
          <label>Max Players</label>
          <span className="setting-value">{settings.maxPlayers}</span>
        </div>
        <input
          type="range"
          min="2"
          max="20"
          value={settings.maxPlayers}
          onChange={(e) => handleSettingChange("maxPlayers", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="setting-control">
        <div className="setting-header">
          <label>Rounds</label>
          <span className="setting-value">{settings.rounds}</span>
        </div>
        <input
          type="range"
          min="2"
          max="10"
          value={settings.rounds}
          onChange={(e) => handleSettingChange("rounds", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="setting-control">
        <div className="setting-header">
          <label>Draw Time (sec)</label>
          <span className="setting-value">{settings.drawTime}s</span>
        </div>
        <input
          type="range"
          min="15"
          max="240"
          step="15"
          value={settings.drawTime}
          onChange={(e) => handleSettingChange("drawTime", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="setting-control">
        <div className="setting-header">
          <label>Word Count</label>
          <span className="setting-value">{settings.wordCount}</span>
        </div>
        <input
          type="range"
          min="1"
          max="5"
          value={settings.wordCount}
          onChange={(e) => handleSettingChange("wordCount", e.target.value)}
          disabled={disabled}
        />
      </div>

      <div className="setting-control">
        <div className="setting-header">
          <label>Hints Per Round</label>
          <span className="setting-value">{settings.hints}</span>
        </div>
        <input
          type="range"
          min="0"
          max="5"
          value={settings.hints}
          onChange={(e) => handleSettingChange("hints", e.target.value)}
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default RoomSettings;
