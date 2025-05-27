import { parseStyleCode } from './parseStyleCode.js';
import sql from 'mssql';
import produccion from './queries/produccion.js';
import dayjs from 'dayjs';
import serverLog from './serverLog.js';

const calculateNewTargets = async (progUpdates, machines) => {
  await parseMachines(machines);
  serverLog(JSON.stringify(machines, null, 2));

  // Look through inserted articulos in MACHINES
  // Use Promise.all to run concurrently
  const newTargets = await Promise.all(
    progUpdates.map(async (newRecord) => {
      serverLog(
        `Calculating new targets for ${newRecord.Articulo} ${newRecord.Talle} ${newRecord.Color}(${newRecord.ColorId})`
      );

      // look for machines making the articulo
      /* Machine states
       * 0: RUN
       * 2: STOP BUTTON
       * 3: AUTOMATIC STOP
       * 4: TARGET
       * 5: F1
       * 6: ELECTRÓNICO
       * 7: MECANICO
       * 9: HILADO
       */
      const targetMachines = machines.filter(
        (machine) =>
          machine.StyleCode.articulo === Math.floor(newRecord.Articulo) &&
          machine.StyleCode.talle === newRecord.Talle &&
          machine.StyleCode.colorId === newRecord.ColorId &&
          machine.State in [0, 2, 3, 4, 5, 6, 7, 9]
      );

      serverLog(
        `Target machines for ${newRecord.Articulo} ${newRecord.Talle} ${
          newRecord.Color
        }(${newRecord.ColorId}): ${JSON.stringify(targetMachines, null, 2)}`
      );

      // if any machines are found
      if (targetMachines.length > 0) {
        const [previousRecord, monthProduction] = await Promise.all([
          getPrevProgramada(newRecord), // get the previous record in programada
          getMonthProduction(newRecord), // get month production
        ]);

        // Use Promise.all to run concurrently
        return Promise.all(
          targetMachines.map(async (machine) => {
            let newTargetObj = {
              machCode: machine.MachCode,
              styleCode: machine.StyleCode.styleCode,
              machTarget: machine.TargetOrder,
              prevProgTarget: previousRecord ? previousRecord.Target : 0,
              newProgTarget: newRecord.Target,
              monthProduction: monthProduction,
              machinePieces: machine.Pieces,
            };

            if (newRecord.Target - monthProduction <= 0) {
              // If the new target is less than the month production, then
              // articulo is done, no need to sum pieces or calculate new target.
              newTargetObj = {
                ...newTargetObj,
                sendTarget: newRecord.Target - monthProduction,
              };
              // TODO: warn articulo is done

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

export { calculateNewTargets };

async function getMonthProduction(newRecord) {
  // TODO: cases where articulo has a punto
  // TODO: cases where articulo or color are null

  const startDate = dayjs()
    .startOf('month')
    .hour(6)
    .second(1)
    .format(process.env.SQL_DATE_FORMAT);
  const endDate = dayjs().format(process.env.SQL_DATE_FORMAT);
  let monthProduction = 0;

  try {
    // Get the production for the month for articulo + talle
    // We don't search for the whole stylecode because of differing
    // color codes.
    // We get the results of all the colors and then filter
    monthProduction = await sql.query(
      produccion(
        'SEAMLESS',
        startDate,
        endDate,
        `${newRecord.Articulo}${newRecord.Talle}`,
        'true'
      )
    );

    // give me an array with an object matching the colorId
    monthProduction = monthProduction.recordset.filter(
      (record) => record.ColorId === newRecord.ColorId
    );

    // The articulo might not be in the production table
    monthProduction =
      monthProduction.length === 0 ? 0 : monthProduction[0].Unidades;

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

async function getPrevProgramada(newRecord) {
  let previousRecord;

  try {
    previousRecord = await sql.query(getPreviousRecord(newRecord));
    previousRecord = previousRecord.recordset[0];
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

function getPreviousRecord(newRecord) {
  return `
      SELECT TOP (1) *
      FROM View_Prog_Color
      WHERE Fecha < '${newRecord.Fecha}'
            AND Articulo = ${newRecord.Articulo}
            AND Talle = ${newRecord.Talle}
            AND ColorId = ${newRecord.ColorId}
      ORDER BY Fecha DESC;
    `;
}

// Machines: [{MachCode, StyleCode: {styleCode, articulo, talle, color, colorId}, ...}]
async function parseMachines(machines) {
  await Promise.all(
    machines.map(async (m) => {
      const parsedStyleCode = await parseStyleCode(m.StyleCode);
      m.StyleCode = { ...parsedStyleCode };
    })
  );
}
