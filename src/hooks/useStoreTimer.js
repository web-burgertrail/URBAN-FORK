import { useState, useEffect } from 'react';

// Restaurant store operating hours: 8:30 AM – 11:30 PM
function getStoreStatus() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();
  const totalSecs = h * 3600 + m * 60 + s;

  const openStart = 8 * 3600 + 30 * 60;  // 8:30 AM = 30600
  const openEnd = 23 * 3600 + 30 * 60;   // 11:30 PM = 84600

  const isOpen = totalSecs >= openStart && totalSecs < openEnd;

  let secsRemaining = 0;
  if (isOpen) {
    secsRemaining = openEnd - totalSecs;
  } else {
    if (totalSecs < openStart) {
      secsRemaining = openStart - totalSecs;
    } else {
      secsRemaining = (86400 - totalSecs) + openStart;
    }
  }

  return { isOpen, secsRemaining };
}

function formatCountdown(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const pad = (n) => String(n).padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function useStoreTimer() {
  const [state, setState] = useState(() => {
    const { isOpen, secsRemaining } = getStoreStatus();
    return { isOpen, secsRemaining, formatted: formatCountdown(secsRemaining) };
  });

  useEffect(() => {
    const tick = () => {
      const { isOpen, secsRemaining } = getStoreStatus();
      setState({ isOpen, secsRemaining, formatted: formatCountdown(secsRemaining) });
    };
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return state;
}
