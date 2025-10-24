import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';
import type { ProgLoadDate, Room } from '../../types';

type ProgLoadDates = Promise<IResult<ProgLoadDate>>;

async function getProgActualDate(
  pool: ConnectionPool,
  room: Room
): ProgLoadDates {
  return pool.request().input('room', sql.NVarChar(10), room).query(`
    SELECT TOP (1) *
    FROM APP_PROG_LOAD_DATES
    WHERE RoomCode = @room
    ORDER BY Date DESC;
  `);
}

export default getProgActualDate;
