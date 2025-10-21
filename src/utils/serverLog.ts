const serverLog = (msg: string) => {
  process.parentPort.postMessage(msg);
  // console.log(msg);
};

module.exports = serverLog;
