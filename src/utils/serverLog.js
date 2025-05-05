const serverLog = (msg) => {
  process.send(msg);
};

export default serverLog;
