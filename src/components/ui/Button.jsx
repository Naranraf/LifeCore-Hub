import React from 'react';
import './Button.css';

/**
 * Button component - Atomic UI
 * 
 * Standardized premium button with glassmorphism and hover effects.
 */
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium', 
  disabled = false,
  className = '',
  id
}) => {
  return (
    <button
      id={id}
      className={`lyfecore-btn btn-${variant} btn-${size} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
