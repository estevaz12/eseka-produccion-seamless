import { sendTelegramAlert } from './utils/sendTelegramAlert.js';

const logElem = document.getElementById('log');

window.electronAPI.onLog((msg) => {
  logElem.textContent += `${msg}\n`;
  logElem.scrollTop = logElem.scrollHeight; // auto scroll
});

window.electronAPI.onSendMessage((msg) => {
  sendTelegramAlert(msg, window.env.BOT_API, window.env.CHAT_ID);
});
