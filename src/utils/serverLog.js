const serverLog = (msg) => {
  process.parentPort.postMessage(msg);
  // console.log(msg);
};

module.exports = serverLog;
