import React, { useMemo } from "react";
import "./HintDisplay.css";

const HintDisplay = ({ hint, word }) => {
  // Use the full word if it's the drawer, otherwise use the hint string
  const displayString = word || hint || "";

  // Split string into characters for individual styling/animation
  const characters = useMemo(() => displayString.split(""), [displayString]);

  return (
    <div className="hint-display-wrapper">
      {characters.map((char, index) => (
        <span 
          key={`${index}-${char}`} 
          className={`char-box ${char === "_" ? "underscore" : "letter"}`}
        >
          {char}
        </span>
      ))}
    </div>
  );
};

export default HintDisplay;
