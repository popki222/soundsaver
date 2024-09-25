import React, { useState, useEffect } from 'react';
import musicHeart from '../../assets/music_heart.png';
import classes from './SongDisplay.module.css';

function SongDisplay() {
  const [shadow, setShadow] = useState('0 3px 6px rgba(0, 0, 0, 0.2)');

  const handleMouseMove = (e) => {
    const card = document.querySelector(`.${classes.card}`);
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const shadowX = -x / 22;
    const shadowY = -y / 22;

    // Use requestAnimationFrame to ensure smooth updates
    window.requestAnimationFrame(() => {
      setShadow(`${shadowX}px ${shadowY}px 20px rgba(0, 0, 0, 0.2)`);
    });
  };

  useEffect(() => {
    // Add throttling to the mouse move event
    let throttleTimeout = null;
    const throttledMouseMove = (e) => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        handleMouseMove(e);
        throttleTimeout = null;
      }, 16); // Approx. 60 FPS
    };

    window.addEventListener('mousemove', throttledMouseMove);
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove);
    };
  }, []);

  return (
    <div className={classes.card} style={{ boxShadow: shadow }}>
      
      <h1>Your Soundcloud Library</h1>
      <div className={classes.buttons}>
      <button className={classes.pushable}>
        <span className={classes.shadow}></span>
        <span className={classes.edge}></span>
        <span className={classes.front}>
            Run Scan
        </span>
      </button>

      
      </div>
    </div>
  );
}

export default SongDisplay;
