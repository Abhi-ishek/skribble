import { useEffect } from "react";

/**
 * Custom hook to manage a countdown timer based on game phase.
 * @param {string} phase - Current game phase.
 * @param {number} timeLeft - Remaining time in seconds.
 * @param {function} tick - Callback function to execute every second.
 */
const useTimer = (phase, timeLeft, tick) => {
  useEffect(() => {
    if (phase !== "drawing") return;

    const interval = setInterval(() => {
      tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [phase, tick]); // ✅ NOT timeLeft — prevents stacking intervals on every tick
};

export default useTimer;
