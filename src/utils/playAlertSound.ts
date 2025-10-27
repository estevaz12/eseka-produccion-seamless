const alertBeep = require('../assets/sounds/alert-beep.wav');

function playAlertSound(times: number = 3, interval: number = 1000) {
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

export default playAlertSound;
