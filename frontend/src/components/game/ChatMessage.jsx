import React from "react";
import "./ChatMessage.css";

const ChatMessage = ({ message }) => {
  const { type, text, playerName } = message;

  const renderContent = () => {
    switch (type) {
      case "guess":
        return (
          <>
            <span className="player-name">{playerName}: </span>
            <span className="text">{text}</span>
          </>
        );
      
      case "correct":
        return (
          <div className="correct-guess-wrapper">
            <span className="icon">✅</span>
            <span className="player-name">{playerName} </span>
            <span className="text">{text}</span>
          </div>
        );

      case "system":
        return <span className="system-text">{text}</span>;

      case "chat":
      default:
        return (
          <>
            <span className="player-name">{playerName}: </span>
            <span className="text">{text}</span>
          </>
        );
    }
  };

  return (
    <div className={`message-item ${type}`}>
      {renderContent()}
    </div>
  );
};

export default ChatMessage;
