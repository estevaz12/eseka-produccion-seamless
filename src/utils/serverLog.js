const serverLog = (msg) => {
  process.parentPort.postMessage(msg);
  // console.log(msg);
};

export default serverLog;
