// src/components/Login/DecoShapes.jsx
// Formas decorativas SVG por slide — ecoam a geometria circular do logo.
import React from 'react';

export default function DecoShapes({ variant }) {
  if (variant === 0) {
    return (
      <>
        <svg className="deco-shape" style={{ top: '15%', right: '12%', opacity: 0.25 }} width="180" height="180" viewBox="0 0 180 180">
          <circle cx="90" cy="90" r="85" fill="none" stroke="#F8D800" strokeWidth="1.5" />
          <circle cx="90" cy="90" r="55" fill="none" stroke="#F07848" strokeWidth="1.5" />
          <circle cx="90" cy="90" r="25" fill="#30C0A8" opacity="0.5" />
        </svg>
        <svg className="deco-shape" style={{ bottom: '40%', left: '8%', opacity: 0.35 }} width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="35" fill="#F07848" />
        </svg>
      </>
    );
  }
  if (variant === 1) {
    return (
      <>
        <svg className="deco-shape" style={{ top: '20%', left: '10%', opacity: 0.35 }} width="160" height="160" viewBox="0 0 160 160">
          <rect x="20" y="20" width="120" height="120" rx="60" fill="none" stroke="#30C0A8" strokeWidth="2" />
        </svg>
        <svg className="deco-shape" style={{ top: '12%', right: '18%', opacity: 0.5 }} width="80" height="80" viewBox="0 0 80 80">
          <circle cx="40" cy="40" r="30" fill="#F8D800" />
        </svg>
      </>
    );
  }
  if (variant === 2) {
    return (
      <>
        <svg className="deco-shape" style={{ top: '18%', right: '14%', opacity: 0.4 }} width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="60" fill="#F07848" opacity="0.7" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="#F07848" strokeWidth="1" />
        </svg>
        <svg className="deco-shape" style={{ top: '50%', left: '12%', opacity: 0.3 }} width="100" height="100" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="#F8D800" strokeWidth="2" />
        </svg>
      </>
    );
  }
  return (
    <>
      <svg className="deco-shape" style={{ top: '15%', right: '10%', opacity: 0.35 }} width="160" height="160" viewBox="0 0 160 160">
        <circle cx="80" cy="80" r="50" fill="#30C0A8" />
      </svg>
      <svg className="deco-shape" style={{ bottom: '35%', right: '20%', opacity: 0.3 }} width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#0090D8" strokeWidth="2" />
      </svg>
    </>
  );
}
