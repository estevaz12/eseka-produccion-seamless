const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
const timezone = require('dayjs/plugin/timezone');
const { Notification } = require('electron');
const path = require('path');
const sendTelegramAlert = require('./sendTelegramAlert');

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault('America/Buenos_Aires');

const now = dayjs.tz().format('DD/MM/YYYY HH:mm:ss');
const prefix = `[${now}][TASKLIST]`;
// used to detect changes in NServer status without spamming notifications
let lastRunning = null;
let errorNotif = null;

function processMonitorMessages(msg, mainWindow) {
  if (msg.type === 'status') {
    const running = msg.running;
    // if lastRunning is null, run a first check
    if (lastRunning === null) {
      if (!running) notifyStatus(running, mainWindow); // only notify if down

      lastRunning = running;
    }

    // if there has been a change in status, notify whether it went up or down
    if (running !== lastRunning) {
      notifyStatus(running, mainWindow);
      // update lastRunning to current running value
      lastRunning = running;
    }
  } else if (msg.type === 'error') {
    // if there is an error, log it
    console.error(`${prefix}[ERROR]: `, msg.error);
  } else {
    console.log(msg.message);
  }
}

module.exports = processMonitorMessages;

function notifyStatus(running, mainWindow) {
  const text = running
    ? 'NServer volvió a funcionar'
    : 'NServer dejó de funcionar';

  if (!running) {
    errorNotif = new Notification({
      title: text,
      body: 'Por favor, inicie NServer para que la aplicación funcione correctamente.',
      timeoutType: 'never',
      icon: path.join(__dirname, 'assets', 'icons', 'error.ico'),
    });
    errorNotif.show();

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('play-alert-sound');
    }

    console.log(`${prefix} ${text}`);
  } else {
    if (errorNotif) errorNotif.close();
    errorNotif = null;

    new Notification({
      title: text,
      body: 'NServer se ha iniciado correctamente.',
      icon: path.join(__dirname, 'assets', 'icons', 'success.ico'),
    }).show();

    console.log(`${prefix} ${text}`);
  }

  sendTelegramAlert(text + (running ? ' ✅' : ' 🚨'));
}
