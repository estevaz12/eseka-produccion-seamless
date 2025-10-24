import type { ConnectionPool, IResult } from 'mssql';
import type { Room } from '../../types';
import sql from 'mssql';

type ProgramadaTotal = Promise<IResult<{ Total: number }>>;

async function getProgramadaTotal(
  pool: ConnectionPool,
  room: Room,
  startDate: string
): ProgramadaTotal {
  return pool
    .request()
    .input('room', sql.NVarChar(10), room)
    .input('startDate', sql.VarChar, startDate).query(`
    SELECT SUM(Docenas) AS Total
    FROM APP_PROGRAMADA AS p
    WHERE p.Fecha = (SELECT MAX(p2.Fecha)
          FROM APP_PROGRAMADA AS p2
          WHERE p2.Articulo = p.Articulo
                AND p2.Talle = p.Talle)
          AND p.RoomCode = @room
      AND p.Fecha >= @startDate
      AND p.Docenas > 0;
  `);
}

export default getProgramadaTotal;
