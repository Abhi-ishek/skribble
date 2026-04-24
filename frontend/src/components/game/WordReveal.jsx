import React, { useEffect, useState } from "react";
import "./WordReveal.css";

const WordReveal = ({ word, scores }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="word-reveal-container">
      <div className="reveal-content-card">
        <header className="reveal-header">
          <p>The word was</p>
          <h1 className="revealed-word">{word}</h1>
        </header>

        {scores && scores.length > 0 && (
          <div className="score-summary">
            <h3>Round Points</h3>
            <div className="score-list">
              {scores.map((s, idx) => (
                <div key={idx} className="score-item">
                  <span className="player-name">{s.name}</span>
                  <span className={`points-added ${s.points > 0 ? 'positive' : ''}`}>
                    {s.points > 0 ? `+${s.points}` : `+0`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WordReveal;
