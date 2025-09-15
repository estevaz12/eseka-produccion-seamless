const dayjs = require('dayjs');

function getWorkEff(row) {
  return row.WorkEfficiency === 0 || !isProducing(row)
    ? null
    : row.WorkEfficiency;
}

function getMachState(row) {
  let machState;

  /* Machine states
  0: RUN
  1: POWER OFF
  2: STOP BUTTON
  3: AUTOMATIC STOP
  4: TARGET
  5: F1 / GIRANDO
  6: ELECTRÓNICO
  7: MECÁNICO
  8: PRODUCCIÓN
  9: FALTA HILADO
  10: FALTA REPUESTO
  11: MUESTRA
  12: CAMBIO DE ARTICULO
  13: TURBINA
  56: OFFLINE
  65535: DESINCRONIZADA
  */
  // styleCode will have PARADA: 1, 8, 11, 13, 56, 65535
  // TODO: for later, APAGADA: 1, 56, 65535
  switch (row.State) {
    case 0:
      machState = { rowColor: '', text: 'TEJIENDO' };
      break;
    case 1:
      machState = { rowColor: 'bg-stop-off', text: 'APAGADA' };
      break;
    case 4:
      machState = {
        rowColor: 'bg-stop-target text-white',
        text: 'STOP TARGET',
      };
      break;
    case 5:
      machState = { rowColor: '', text: 'GIRANDO' };
      break;
    case 6:
      machState = { rowColor: 'bg-stop-electronico', text: 'ELECTRÓNICO' };
      break;
    case 7:
      machState = { rowColor: 'bg-stop-mecanico', text: 'MECÁNICO' };
      break;
    case 8:
      machState = {
        rowColor: 'bg-stop-produccion text-white',
        text: 'STOP PRODUCCIÓN',
      };
      break;
    case 9:
      machState = { rowColor: 'bg-stop-hilado', text: 'FALTA HILADO' };
      break;
    case 10:
      machState = { rowColor: 'bg-stop-repuesto', text: 'FALTA REPUESTO' };
      break;
    case 11:
      machState = { rowColor: 'bg-stop-muestra', text: 'MUESTRA' };
      break;
    case 12:
      machState = { rowColor: 'bg-stop-cambio text-white', text: 'CAMBIO' };
      break;
    case 13:
      machState = { rowColor: 'bg-stop-turbina', text: 'TURBINA' };
      break;
    case 56:
      machState = { rowColor: 'bg-stop-off', text: 'OFFLINE' };
      break;
    case 65535:
      machState = { rowColor: 'bg-stop-off', text: 'DESINCRONIZADA' };
      break;
    default:
      machState = { rowColor: 'bg-stop-general', text: 'STOP GENERAL' };
      break;
  }

  if (row.State !== 0 && row.State !== 5)
    machState.rowColor += ' hover:bg-row-hover hover:text-black';

  return machState;
}

function isProducing(row) {
  return [0, 2, 3, 5].includes(row.State);
}

function isParada(row) {
  return [1, 8, 11, 13, 56, 65535].includes(row.State);
}

function calcIdealTime(row) {
  if (!isProducing(row) || row.TargetOrder === 0 || row.WorkEfficiency === 0)
    return 0;

  let idealTime = row.IdealCycle * (row.TargetOrder - row.Pieces);
  return idealTime;
}

function calcRealTime(row) {
  if (!isProducing(row) || row.TargetOrder === 0 || row.WorkEfficiency === 0)
    return 0;

  let actualTime = calcIdealTime(row) / (row.WorkEfficiency / 100);
  return actualTime;
}

function getDuration(seconds) {
  return seconds === 0
    ? null
    : dayjs.tz().add(seconds, 'seconds').format('DD/MM HH:mm');
}

function getDurationUnix(seconds) {
  return seconds === 0 ? null : dayjs.tz().add(seconds, 'seconds').valueOf();
}

module.exports = {
  getWorkEff,
  getMachState,
  isProducing,
  isParada,
  calcIdealTime,
  calcRealTime,
  getDuration,
  getDurationUnix,
};
