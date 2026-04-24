import React from 'react';
import './Button.css';

/**
 * Button component - Atomic UI
 * 
 * Standardized premium button with glassmorphism and hover effects.
 */
const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium', 
  className = '',
  ...props 
}) => {
  return (
    <button
      className={`lyfecore-btn btn-${variant} btn-${size} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
