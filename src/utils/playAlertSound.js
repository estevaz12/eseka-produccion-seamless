import alertBeep from '../assets/sounds/alert-beep.wav';

function playAlertSound(times = 3, interval = 1000) {
  let played = 0;
  const playOnce = () => {
    const audio = new Audio(alertBeep);
    audio.play().catch((err) => console.error('Audio play error:', err));
    played++;
    if (played < times) {
      setTimeout(playOnce, interval); // interval in ms between plays
    }
  };
  playOnce();
}

export { playAlertSound };
