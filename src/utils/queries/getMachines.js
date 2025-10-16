const sql = require('mssql');

const getMachines = async (pool, room) => {
  /* Machine states
  0: RUN
  1: POWER OFF
  2: STOP BUTTON
  3: AUTOMATIC STOP
  4: TARGET
  5: F1
  6: ELECTRÓNICO
  7: MECANICO
  8: PRODUCCIÓN
  9: FALTA HILADO
  10: FALTA REPUESTO
  11: MUESTRA
  12: CAMBIO DE ARTICULO
  13: TURBINA	
  56: OFFLINE
  65535: DESINCRONIZADA
  */
  return pool.request().input('room', sql.Char(30), room).query(`
    SELECT MachCode, 
           StyleCode, 
           Pieces, 
           TargetOrder, 
           State, 
           IdealCycle, 
           WorkEfficiency,
           RoomCode
    FROM [dbNautilus].[dbo].[MACHINES]
    WHERE RoomCode = '${room}';
  `);
};

module.exports = getMachines;
