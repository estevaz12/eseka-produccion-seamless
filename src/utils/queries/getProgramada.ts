import type { ConnectionPool, IResult } from 'mssql';
import type { Programada, Room } from '../../types';
import sql from 'mssql';

type Programadas = Promise<IResult<Programada>>;

async function getProgramada(
  pool: ConnectionPool,
  room: Room,
  startDate: string
): Programadas {
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
}

export default getProgramada;
