import React, { useEffect } from "react";
import "./GameCanvas.css";

const GameCanvas = ({ canvasRef, isDrawer, phase }) => {
  // Initialize canvas with white background on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      // Only fill if it's empty to avoid clearing remote drawings on re-renders
      // However, for simplicity and ensuring a clean start:
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [canvasRef]);

  const canDraw = isDrawer && phase === "drawing";

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        style={{ cursor: canDraw ? "crosshair" : "default" }}
        className="game-canvas"
      />
    </div>
  );
};

export default GameCanvas;
