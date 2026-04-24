import React, { useState } from "react";
import "./DrawingTools.css";

const PALETTE = [
  "#000000", "#ffffff", "#7f8c8d", "#c0392b", 
  "#d35400", "#f39c12", "#27ae60", "#16a085", 
  "#2980b9", "#8e44ad", "#2c3e50", "#ff4757"
];

const BRUSH_SIZES = [
  { label: "S", value: 3 },
  { label: "M", value: 8 },
  { label: "L", value: 16 }
];

const DrawingTools = ({ setColor, setSize, setEraser, clearCanvas, undoStroke, isDrawer }) => {
  const [activeColor, setActiveColor] = useState("#000000");
  const [activeSize, setActiveSize] = useState(8);
  const [isEraserMode, setIsEraserMode] = useState(false);

  if (!isDrawer) return null;

  const handleColorClick = (color) => {
    setActiveColor(color);
    setColor(color);
    setIsEraserMode(false);
    setEraser(false);
  };

  const handleSizeClick = (size) => {
    setActiveSize(size);
    setSize(size);
  };

  const handleEraserToggle = () => {
    const newMode = !isEraserMode;
    setIsEraserMode(newMode);
    setEraser(newMode);
  };

  return (
    <div className="artist-toolbox">
      <div className="toolbox-section">
        <label>Colors</label>
        <div className="color-grid">
          {PALETTE.map((color) => (
            <button
              key={color}
              className={`swatch ${activeColor === color && !isEraserMode ? "active" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => handleColorClick(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="toolbox-section">
        <label>Brush Size</label>
        <div className="size-selector">
          {BRUSH_SIZES.map((size) => (
            <button
              key={size.value}
              className={`size-btn ${activeSize === size.value ? "active" : ""}`}
              onClick={() => handleSizeClick(size.value)}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      <div className="toolbox-section actions">
        <button 
          className={`tool-icon-btn ${isEraserMode ? "active" : ""}`}
          onClick={handleEraserToggle}
          title="Eraser"
        >
          🧽
        </button>
        <button 
          className="tool-icon-btn" 
          onClick={undoStroke}
          title="Undo"
        >
          ↩️
        </button>
        <button 
          className="tool-icon-btn danger" 
          onClick={() => {
            if (window.confirm("Clear the entire canvas?")) {
              clearCanvas();
            }
          }}
          title="Clear Canvas"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default DrawingTools;
