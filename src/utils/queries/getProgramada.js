const dayjs = require('dayjs');
const sql = require('mssql');

const getProgramada = async (pool, room, startDate) => {
  return pool
    .request()
    .input('room', sql.NVarChar(10), room)
    .input('startDate', sql.VarChar, startDate).query(`
    SELECT p.*
    FROM APP_PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
                      FROM APP_PROGRAMADA AS p2
                      WHERE p2.Articulo = p.Articulo 
                            AND p2.Talle = p.Talle)
          AND p.Fecha >= @startDate
          AND p.RoomCode = @room
    ORDER BY p.Articulo, p.Talle;
  `);
};

module.exports = getProgramada;
