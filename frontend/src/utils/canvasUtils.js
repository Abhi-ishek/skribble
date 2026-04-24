/**
 * Replays a full history of strokes on a canvas.
 * @param {HTMLCanvasElement} canvas 
 * @param {Array} strokes - Array of stroke arrays (each stroke is an array of segments).
 */
export const replayStrokes = (canvas, strokes) => {
  if (!canvas || !strokes) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // 1. Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // 2. Loop each stroke session
  strokes.forEach((stroke) => {
    // 3. Loop each segment in the session
    stroke.forEach((segment) => {
      switch (segment.type) {
        case "start":
          ctx.beginPath();
          ctx.moveTo(segment.x, segment.y);
          ctx.strokeStyle = segment.color || "#000000";
          ctx.lineWidth = segment.size || 5;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          break;
        case "move":
          ctx.lineTo(segment.x, segment.y);
          ctx.stroke();
          break;
        case "end":
          ctx.closePath();
          break;
        default:
          break;
      }
    });
  });
};

/**
 * Formats seconds into a "m:ss" string.
 * @param {number} seconds 
 * @returns {string}
 */
export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};
