import React from 'react';
import './Card.css';

/**
 * Card component - Atomic UI
 * 
 * Container with glassmorphism, blur, and premium borders.
 */
const Card = ({ children, className = '', id, ...props }) => {
  return (
    <div id={id} className={`lyfecore-card ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
