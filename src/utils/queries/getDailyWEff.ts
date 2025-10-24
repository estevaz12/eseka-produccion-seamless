import sql from 'mssql';
import type { Room } from '../../types';
import type { ConnectionPool, IResult } from 'mssql';

type DailyWEff = Promise<IResult<any>>;

async function getDailyWEff(pool: ConnectionPool, room: Room): DailyWEff {
  return pool.request().input('room', sql.Char(30), room).query(`
      SELECT ProdDate, RoomCode, WorkEfficiency 
      FROM WEff_Diario
      WHERE RoomCode = @room AND WorkEfficiency > 0
      ORDER BY ProdDate
    `);
}

export default getDailyWEff;
