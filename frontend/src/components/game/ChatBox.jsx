import React, { useEffect, useRef } from "react";
import ChatMessage from "./ChatMessage";
import GuessInput from "./GuessInput";
import "./ChatBox.css";

const ChatBox = ({ messages, roomCode, sendGuess, phase, socketId, players }) => {
  const scrollRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Find if current player has already guessed correctly
  const currentPlayer = players.find(p => p.playerId === socketId);
  const hasGuessed = currentPlayer?.hasGuessedCorrectly || false;
  const isDrawer = players.find(p => p.isDrawer)?.playerId === socketId;

  return (
    <div className="chat-box-container">
      <div className="chat-header">
        <h3>Live Chat</h3>
      </div>
      
      <div className="messages-list">
        {messages.map((msg, index) => (
          <ChatMessage 
            key={index} 
            message={msg} 
          />
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="chat-input-area">
        <GuessInput 
          onSend={(text) => sendGuess(roomCode, text)} 
          disabled={hasGuessed || isDrawer || phase !== "drawing"} 
          placeholder={phase === "drawing" ? "Type your guess..." : "Chat..."}
        />
      </div>
    </div>
  );
};

export default ChatBox;
