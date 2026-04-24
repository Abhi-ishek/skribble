import React from "react";
import "./WordSelector.css";

const WordSelector = ({ wordOptions, onChoose, drawerName, isDrawer }) => {
  return (
    <div className="word-selector-overlay">
      <div className="glass-card selector-panel">
        {isDrawer ? (
          <div className="drawer-view">
            <h2 className="selector-title">Pick a Word</h2>
            <p className="selector-hint">Select one to start drawing!</p>
            <div className="word-button-grid">
              {wordOptions.map((word) => (
                <button
                  key={word}
                  className="word-select-btn"
                  onClick={() => onChoose(word)}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="guesser-view">
            <div className="loading-animation">
              <span className="dot"></span>
              <span className="dot"></span>
              <span className="dot"></span>
            </div>
            <h2 className="selector-title">Wait a Moment</h2>
            <p className="selector-hint">
              <span className="drawer-highlight">{drawerName}</span> is choosing a word...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordSelector;
