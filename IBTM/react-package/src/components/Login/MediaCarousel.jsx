// src/components/Login/MediaCarousel.jsx
import React, { useCallback, useEffect, useState } from 'react';
import DecoShapes from './DecoShapes';
import { ChevronLeftIcon, ChevronRightIcon } from './icons';
import { SLIDES as DEFAULT_SLIDES } from './slides';

export default function MediaCarousel({ slides = DEFAULT_SLIDES, autoPlayMs = 5500 }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = slides.length;

  const next = useCallback(() => setI((v) => (v + 1) % total), [total]);
  const prev = useCallback(() => setI((v) => (v - 1 + total) % total), [total]);

  useEffect(() => {
    if (paused || total <= 1) return;
    const id = setInterval(next, autoPlayMs);
    return () => clearInterval(id);
  }, [next, paused, total, autoPlayMs]);

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });

  return (
    <div
      className="ibtm-media-side"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slides.map((s, idx) => (
        <div key={idx} className={`ibtm-slide ${s.cls} ${idx === i ? 'is-active' : ''}`}>
          <DecoShapes variant={idx} />
          <div className="ibtm-slide-content">
            <div className="ibtm-slide-eyebrow">{s.eyebrow}</div>
            <h2 className="ibtm-slide-title">{s.title}</h2>
            <p className="ibtm-slide-meta">{s.meta}</p>
          </div>
        </div>
      ))}

      <div className="ibtm-media-top">
        <div style={{ textTransform: 'capitalize' }}>{today}</div>
        <div className="ibtm-live">
          <span className="ibtm-live-dot" />
          <span>IBTM · Tabernáculo da Manhã</span>
        </div>
      </div>

      <div className="ibtm-carousel-chrome">
        <div className="ibtm-carousel-dots">
          {slides.map((_, idx) => (
            <button
              key={idx}
              aria-label={`Slide ${idx + 1}`}
              onClick={() => setI(idx)}
              className={`ibtm-dot ${idx === i ? 'is-active' : ''}`}
              type="button"
            />
          ))}
        </div>
        <button className="ibtm-nav-btn" aria-label="Anterior" onClick={prev} type="button">
          <ChevronLeftIcon />
        </button>
        <button className="ibtm-nav-btn" aria-label="Próximo" onClick={next} type="button">
          <ChevronRightIcon />
        </button>
      </div>
    </div>
  );
}
