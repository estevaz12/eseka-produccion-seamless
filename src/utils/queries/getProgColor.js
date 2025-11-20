const dayjs = require('dayjs');
const sql = require('mssql');

const getProgColor = async (pool, room, startDate, includeDeleted = false) => {
  const fecha = startDate.format(process.env.SQL_DATE_FORMAT);
  return pool
    .request()
    .input('fecha', sql.VarChar, fecha)
    .input('room', sql.NVarChar(10), room).query(`
    SELECT pc.*
    FROM View_Prog_Color AS pc
    WHERE pc.Fecha = (SELECT MAX(pc2.Fecha)
                      FROM View_Prog_Color AS pc2
                      WHERE pc2.Articulo = pc.Articulo 
                            AND pc2.Talle = pc.Talle)
          AND pc.Fecha >= @fecha
          AND pc.RoomCode = @room
          ${includeDeleted ? '' : 'AND pc.DocProg > 0'}
    ORDER BY pc.Articulo, pc.Talle;
  `);
};

module.exports = getProgColor;
