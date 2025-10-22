export default function serverLog(msg: string) {
  process.parentPort.postMessage(msg);
  // console.log(msg);
}
