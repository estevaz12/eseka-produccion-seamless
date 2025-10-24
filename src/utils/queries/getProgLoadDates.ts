import type { ConnectionPool, IResult } from 'mssql';
import type { ProgLoadDate, Room } from '../../types';
import sql from 'mssql';

type ProgLoadDates = Promise<IResult<ProgLoadDate>>;

async function getProgLoadDates(
  pool: ConnectionPool,
  room: Room
): ProgLoadDates {
  return pool.request().input('room', sql.NVarChar(10), room).query(`
    SELECT *
    FROM APP_PROG_LOAD_DATES
    WHERE RoomCode = @room
    ORDER BY Date DESC;
  `);
}

export default getProgLoadDates;
