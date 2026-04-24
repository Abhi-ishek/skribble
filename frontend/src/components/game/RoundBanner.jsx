import React, { useEffect, useState } from "react";
import "./RoundBanner.css";

const RoundBanner = ({ round, totalRounds, drawerName }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="round-banner-overlay">
      <div className="round-banner-card">
        <div className="round-count">ROUND {round} OF {totalRounds}</div>
        <div className="drawer-announcement">
          <span className="artist-name">{drawerName}</span> is drawing!
        </div>
      </div>
    </div>
  );
};

export default RoundBanner;
