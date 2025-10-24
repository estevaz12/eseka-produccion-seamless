import type { ConnectionPool, IResult } from 'mssql';
import type { ProgStartDateData, Room } from '../../types';
import sql from 'mssql';

type ProgStartDateInsert = Promise<IResult<any>>;

async function insertProgStartDate(
  pool: ConnectionPool,
  data: ProgStartDateData,
  room: Room
): ProgStartDateInsert {
  return pool
    .request()
    .input('date', sql.VarChar, data.date)
    .input('month', sql.TinyInt, Number(data.month))
    .input('year', sql.SmallInt, Number(data.year))
    .input('room', sql.NVarChar(10), room).query(`
      INSERT INTO APP_PROG_LOAD_DATES (Date, Month, Year, RoomCode)
        VALUES (@date, @month, @year, @room);
  `);
}

export default insertProgStartDate;
