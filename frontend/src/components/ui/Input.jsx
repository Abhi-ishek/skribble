import React from "react";
import "./Input.css";

const Input = ({ 
  value, 
  onChange, 
  placeholder, 
  onSubmit, 
  maxLength, 
  style,
  className = "",
  type = "text",
  ...props 
}) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <input
      type={type}
      className={`custom-input ${className}`}
      value={value}
      onChange={onChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      maxLength={maxLength}
      style={style}
      autoComplete="off"
      {...props}
    />
  );
};

export default Input;
