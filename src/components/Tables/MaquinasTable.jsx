import { useMemo } from 'react';
import EnhancedTable from './EnhancedTable.jsx';
import { DatesContext } from '../../Contexts.js';
import dayjs from 'dayjs';

export default function MaquinasTable({ machines, pdfRows }) {
  const cols = [
    {
      id: 'MachCode',
      label: 'Máquina',
      align: 'center',
      width: 'w-[9%]',
    },
    {
      id: 'StyleCode',
      label: 'Cadena',
      align: 'center',
    },
    {
      id: 'Pieces',
      label: 'Prendas',
      align: 'right',
      width: 'w-[8%]',
      sortFn: (a, b, order) => {
        let aPieces = a.Pieces;
        let bPieces = b.Pieces;

        if (!aPieces) aPieces = order === 'asc' ? Infinity : -Infinity;
        if (!bPieces) bPieces = order === 'asc' ? Infinity : -Infinity;

        return bPieces - aPieces;
      },
    },
    {
      id: 'TargetOrder',
      label: 'Target',
      align: 'right',
      width: 'w-[8%]',
      sortFn: (a, b, order) => {
        let aTargetOrder = a.TargetOrder;
        let bTargetOrder = b.TargetOrder;

        if (!aTargetOrder)
          aTargetOrder = order === 'asc' ? Infinity : -Infinity;
        if (!bTargetOrder)
          bTargetOrder = order === 'asc' ? Infinity : -Infinity;

        return bTargetOrder - aTargetOrder;
      },
    },
    {
      id: 'idealTime',
      label: 'Tiempo al 100%',
      align: 'center',
      pdfRender: (row) => getDuration(calcIdealTime(row)),
      sortFn: (a, b, order) => {
        let aIdealTime = getDurationUnix(calcIdealTime(a));
        let bIdealTime = getDurationUnix(calcIdealTime(b));

        if (!aIdealTime) aIdealTime = order === 'asc' ? Infinity : -Infinity;
        if (!bIdealTime) bIdealTime = order === 'asc' ? Infinity : -Infinity;

        return bIdealTime - aIdealTime;
      },
    },
    {
      id: 'realTime',
      label: 'Tiempo Real',
      align: 'center',
      pdfRender: (row) => getDuration(calcRealTime(row)),
      sortFn: (a, b, order) => {
        let aRealTime = getDurationUnix(calcRealTime(a));
        let bRealTime = getDurationUnix(calcRealTime(b));

        if (!aRealTime) aRealTime = order === 'asc' ? Infinity : -Infinity;
        if (!bRealTime) bRealTime = order === 'asc' ? Infinity : -Infinity;

        return bRealTime - aRealTime;
      },
    },
    {
      id: 'WorkEfficiency',
      label: 'Eff. %',
      align: 'right',
      width: 'w-[6%]',
      pdfRender: (row) => getWorkEff(row) && `${getWorkEff(row)}%`,
      sortFn: (a, b, order) => {
        let aWorkEff = getWorkEff(a);
        let bWorkEff = getWorkEff(b);

        if (!aWorkEff) aWorkEff = order === 'asc' ? Infinity : -Infinity;
        if (!bWorkEff) bWorkEff = order === 'asc' ? Infinity : -Infinity;

        return bWorkEff - aWorkEff;
      },
    },
    {
      id: 'State',
      label: 'Estado',
      align: 'center',
      pdfRender: (row) => getMachState(row).text,
      sortFn: (a, b, order) => {
        const orderMap = {
          8: 0, // PRODUCCION
          6: 1, // ELECTRONICO
          7: 2, // MECANICO
          11: 3, // MUESTRA
          9: 4, // FALTA HILADO
          10: 5, // FALTA REPUESTO
          13: 6, // TURBINA
          12: 7, // CAMBIO ARTICULO
          5: 9, // TARGET
          4: 8, // F1
          3: 11, // STOP BUTTON
          2: 10, // AUTOMATIC STOP
          1: 12, // RUN
          0: 13, // POWER OFF
          56: 14, // OFFLINE
          65535: 15, // DESINCRONIZADA
        };
        return orderMap[b.State] - orderMap[a.State];
      },
    },
  ];

  function renderRow(row, i, opened, handleClick) {
    let machState = getMachState(row);

    return [
      machState.rowColor,
      <>
        <td align='center' className='font-semibold'>
          {row.MachCode}
        </td>
        <td align='center' className='font-semibold'>
          {row.StyleCode}
        </td>
        <td align='right'>{row.Pieces}</td>
        <td align='right'>{row.TargetOrder}</td>
        <td align='center'>{getDuration(calcIdealTime(row))}</td>
        <td align='center'>{getDuration(calcRealTime(row))}</td>
        <td align='right'>{getWorkEff(row) && `${getWorkEff(row)}%`}</td>
        <td align='center'>{machState.text}</td>
      </>,
    ];
  }

  // Memoized eff avg for footer
  const getWorkEffAvg = useMemo(() => {
    const producingMachs = machines.filter(isProducing);
    return (
      producingMachs.reduce((acc, row) => acc + row.WorkEfficiency, 0) /
      producingMachs.length
    );
  }, [machines]);

  return (
    <DatesContext
      value={{ startDate: dayjs.tz(), fromMonthStart: false, endDate: null }}
    >
      <EnhancedTable
        cols={cols}
        rows={machines}
        pdfRows={pdfRows}
        renderRow={renderRow}
        initOrder='asc'
        initOrderBy='MachCode'
        headerTop='top-[94px]'
        footer={[
          true, // Prendas
          true, // Target
          true, // Tiempo al 100%
          true, // Tiempo Actual
          `${Math.round(getWorkEffAvg)}%`, // Eff. %
          `${machines.length} máquinas`, // Estado
        ]}
        uniqueIds={['MachCode']}
      />
    </DatesContext>
  );
}

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
      machState = { rowColor: '', text: 'RUN' };
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

function calcIdealTime(row) {
  if (!isProducing(row) || row.TargetOrder === 0) return 0;

  let idealTime = row.IdealCycle * (row.TargetOrder - row.Pieces);
  return idealTime;
}

function calcRealTime(row) {
  if (!isProducing(row) || row.TargetOrder === 0) return 0;

  let actualTime = calcIdealTime(row) / (row.WorkEfficiency / 100);
  return actualTime;
}

function getDuration(seconds) {
  return seconds === 0
    ? null
    : dayjs.tz().add(seconds, 'seconds').format('DD/MM/YYYY HH:mm');
}

function getDurationUnix(seconds) {
  return seconds === 0 ? null : dayjs.tz().add(seconds, 'seconds').valueOf();
}
