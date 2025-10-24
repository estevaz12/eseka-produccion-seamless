import type { ConnectionPool, IResult } from 'mssql';
import type { ProgColor, Room } from '../../types';
import type { Dayjs } from 'dayjs';
import sql from 'mssql';

type ProgColors = Promise<IResult<ProgColor>>;

async function getProgColor(
  pool: ConnectionPool,
  room: Room,
  startDate: Dayjs,
  includeDeleted: boolean = false
): ProgColors {
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
}

export default getProgColor;
