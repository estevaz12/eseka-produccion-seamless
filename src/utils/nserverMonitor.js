const { exec } = require('child_process');

function checkNServer() {
  // execute tasklist command to check for NServer.exe on Windows
  exec('tasklist', { windowsHide: true }, (error, stdout, stderr) => {
    // if error occurs, send error message back to parent
    if (error) {
      process.parentPort.postMessage({ type: 'error', error: error.message });
      return;
    }
    // check if NServer.exe is in the list of running processes
    const running = /\bNServer\.exe\b/i.test(stdout);
    // send status message back to parent
    process.parentPort.postMessage({ type: 'status', running });
  });
}

checkNServer();
setInterval(checkNServer, 10000); // check every 10 seconds
