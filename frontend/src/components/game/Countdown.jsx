import React, { useMemo } from "react";
import "./Countdown.css";

const Countdown = ({ timeLeft, drawTime }) => {
  const percentage = (timeLeft / drawTime) * 100;
  
  // Calculate stroke-dashoffset for the progress ring
  // Circumference = 2 * PI * R (R=20) ≈ 125.6
  const circumference = 125.6;
  const offset = useMemo(() => {
    return circumference - (timeLeft / drawTime) * circumference;
  }, [timeLeft, drawTime]);

  const getColorClass = () => {
    if (percentage < 25) return "critical";
    if (percentage < 50) return "warning";
    return "normal";
  };

  return (
    <div className={`countdown-timer ${getColorClass()}`}>
      <svg className="timer-svg" width="50" height="50">
        <circle 
          className="timer-bg" 
          cx="25" cy="25" r="20" 
        />
        <circle 
          className="timer-progress" 
          cx="25" cy="25" r="20"
          style={{ strokeDashoffset: offset }}
        />
      </svg>
      <span className="time-text">{timeLeft}</span>
    </div>
  );
};

export default Countdown;
