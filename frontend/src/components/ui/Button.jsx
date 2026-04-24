import React from "react";
import "./Button.css";

const Button = ({ 
  children, 
  variant = "primary", 
  onClick, 
  disabled = false, 
  fullWidth = false,
  className = "",
  ...props 
}) => {
  const classes = [
    "custom-btn",
    `btn-${variant}`,
    fullWidth ? "btn-full" : "",
    className
  ].join(" ").trim();

  return (
    <button
      className={classes}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
