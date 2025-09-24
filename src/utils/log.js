function log(mainWindow, ...args) {
  // stringify each arg: objects → JSON, others → String
  const parts = args.map((arg) => {
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg, null, 2); // pretty print
      } catch {
        return String(arg);
      }
    }
    return String(arg);
  });

  const msg = parts.join(' ');

  console.log(msg);
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('log', msg);
  }
}

module.exports = log;
