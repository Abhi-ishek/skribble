import React from "react";
import { getAvatarColor } from "../../utils/formatters";
import "./PlayerCard.css";

const PlayerCard = ({ player, isYou }) => {
  const avatarColor = getAvatarColor(player.name);

  return (
    <div className={`player-card-item ${player.isHost ? "is-host" : ""} ${isYou ? "is-you" : ""}`}>
      <div 
        className="avatar-circle" 
        style={{ backgroundColor: avatarColor }}
      >
        {player.name.charAt(0).toUpperCase()}
      </div>
      <div className="player-info">
        <span className="player-name">
          {player.name} {player.isHost && "👑"}
        </span>
        {isYou && <span className="you-label">(You)</span>}
      </div>
    </div>
  );
};

export default PlayerCard;
