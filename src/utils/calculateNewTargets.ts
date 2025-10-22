import sql, { ConnectionPool } from 'mssql';
import { runProduccion } from './queries/produccion.js';
import dayjs from 'dayjs';
import serverLog from './serverLog.js';
import { MachineParsed, Produccion, ProgColor } from '../types';

interface NewTarget {
  machCode: number;
  styleCode: string;
  machTarget: number;
  prevProgTarget: number;
  newProgTarget: number;
  monthProduction: number;
  machPieces: number;
  sendTarget: number | string;
}

const calculateNewTargets = async (
  pool: ConnectionPool,
  progUpdates: ProgColor[],
  machines: MachineParsed[]
) => {
  // Look through inserted articulos in MACHINES
  // Use Promise.all to run concurrently
  const newTargets = await Promise.all(
    progUpdates.map(async (newRecord) => {
      serverLog(
        `Calculating new targets for ${newRecord.Articulo} ${newRecord.Talle} ${newRecord.Color}(${newRecord.ColorId})`
      );

      // look for machines making the articulo
      const targetMachines = machines.filter(
        (machine) =>
          machine.StyleCode.articulo === newRecord.Articulo &&
          machine.StyleCode.talle === newRecord.Talle &&
          machine.StyleCode.colorId === newRecord.ColorId
      );

      serverLog(
        `Target machines for ${newRecord.Articulo} ${newRecord.Talle} ${
          newRecord.Color
        }(${newRecord.ColorId}): ${JSON.stringify(targetMachines, null, 2)}`
      );

      // if any machines are found
      if (targetMachines.length > 0) {
        const [previousRecord, monthProduction] = await Promise.all([
          getPrevProgramada(pool, newRecord), // get the previous record in programada
          getMonthProduction(pool, newRecord), // get month production
        ]);

        // Use Promise.all to run concurrently
        return Promise.all(
          targetMachines.map(async (machine) => {
            let newTargetObj: NewTarget = {
              machCode: machine.MachCode,
              styleCode: machine.StyleCode.styleCode,
              machTarget: machine.TargetOrder,
              prevProgTarget: previousRecord ? previousRecord.Target : 0,
              newProgTarget: newRecord.Target,
              monthProduction: monthProduction,
              machPieces: machine.Pieces,
              sendTarget: 0,
            };

            if (newRecord.Target - monthProduction <= 0) {
              // If the new target is less than the month production, then
              // articulo is done, no need to sum pieces or calculate new target.
              newTargetObj = {
                ...newTargetObj,
                sendTarget: `PARAR (${newRecord.Target - monthProduction})`,
              };

              serverLog(
                `New target for ${
                  machine.StyleCode.styleCode
                }: ${JSON.stringify(newTargetObj, null, 2)}`
              );
            } else if (
              // If 2+ machines are found, newTarget needs to be calculated
              targetMachines.length === 1 &&
              // If no previous record, then send new target
              (!previousRecord ||
                Object.keys(previousRecord).length === 0 ||
                // If no target and articulo was not done before,
                // then send the new target
                (machine.TargetOrder === 0 &&
                  monthProduction === machine.Pieces) ||
                // If target is the same as the previous record in programada
                // then just update the target to the new one
                previousRecord.Target === machine.TargetOrder)
            ) {
              newTargetObj = {
                ...newTargetObj,
                sendTarget: newRecord.Target,
              };

              serverLog(
                `New target for ${
                  machine.StyleCode.styleCode
                }: ${JSON.stringify(newTargetObj, null, 2)}`
              );
            } else {
              // If machine target is different than prevRecord, means that articulo
              // was incomplete OR the counter was reset at some point. To
              // calculate new target, get the production from the month and subtract
              // newTarget - monthProduction / targetMachines.length + machine.Pieces
              let newTarget = Math.ceil(
                (newRecord.Target - monthProduction) / targetMachines.length +
                  machine.Pieces
              );
              newTarget = newTarget % 2 === 0 ? newTarget : newTarget + 1; // make it even

              newTargetObj = {
                ...newTargetObj,
                sendTarget: newTarget,
              };

              serverLog(
                `New target for ${
                  machine.StyleCode.styleCode
                }: ${JSON.stringify(newTargetObj, null, 2)}`
              );
            }

            return newTargetObj;
          })
        );
      }

      return []; // to avoid undefined in the array
    })
  );

  // Flatten the array of arrays
  return newTargets.flat();
};

module.exports = calculateNewTargets;

async function getMonthProduction(pool: ConnectionPool, newRecord: ProgColor) {
  const startDate = dayjs
    .tz()
    .startOf('month')
    .hour(6)
    .minute(0)
    .second(1)
    .format(process.env.SQL_DATE_FORMAT);
  const endDate = dayjs.tz().format(process.env.SQL_DATE_FORMAT);
  let monthProduction = 0;

  try {
    // Get the production for the month
    const res = await runProduccion(
      pool,
      newRecord.RoomCode,
      startDate,
      endDate,
      true,
      newRecord.Articulo,
      newRecord.Talle,
      newRecord.ColorId
    );
    const data: Produccion = res.recordset;

    // The articulo might not be in the production table
    monthProduction = data.length === 0 ? 0 : data[0].Unidades;

    serverLog(
      `Month production for ${newRecord.Articulo} ${newRecord.Talle} ${
        newRecord.Color
      }(${newRecord.ColorId}): ${JSON.stringify(monthProduction, null, 2)}`
    );
  } catch (err) {
    serverLog(`[ERROR] [produccion] SQL Error: ${err}`);
  }

  return monthProduction;
}

async function getPrevProgramada(pool: ConnectionPool, newRecord: ProgColor) {
  let previousRecord: ProgColor;

  try {
    const result = await getPreviousRecord(pool, newRecord);
    previousRecord = result.recordset[0];
    serverLog(
      `Previous record for ${newRecord.Articulo} ${newRecord.Talle} ${
        newRecord.Color
      }(${newRecord.ColorId}): ${JSON.stringify(previousRecord, null, 2)}`
    );
  } catch (err) {
    serverLog(`[ERROR] [getPreviousRecord] SQL Error: ${err}`);
  }

  return previousRecord;
}

function getPreviousRecord(pool: ConnectionPool, newRecord: ProgColor) {
  return pool
    .request()
    .input('room', sql.NVarChar(10), newRecord.RoomCode)
    .input('fecha', sql.VarChar, newRecord.Fecha)
    .input('articulo', sql.Numeric(7, 2), Number(newRecord.Articulo))
    .input('talle', sql.TinyInt, Number(newRecord.Talle))
    .input('colorId', sql.SmallInt, Number(newRecord.ColorId)).query(`
      SELECT TOP (1) *
      FROM View_Prog_Color
      WHERE RoomCode = @room
            AND Fecha < @fecha
            AND Articulo = @articulo
            AND Talle = @talle
            AND ColorId = @colorId
      ORDER BY Fecha DESC;
    `);
}
