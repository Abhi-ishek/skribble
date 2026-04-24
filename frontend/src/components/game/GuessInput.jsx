import React, { useState } from "react";
import "./GuessInput.css";

const GuessInput = ({ onSend, disabled, placeholder }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    
    onSend(text.trim());
    setText("");
  };

  return (
    <form className="guess-input-container" onSubmit={handleSubmit}>
      <input
        type="text"
        className="guess-field"
        placeholder={placeholder}
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={disabled}
        autoComplete="off"
        maxLength={50}
      />
      <button 
        type="submit" 
        className="guess-submit-btn" 
        disabled={disabled || !text.trim()}
      >
        Send
      </button>
    </form>
  );
};

export default GuessInput;
