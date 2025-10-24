import insertProgramada from './insertProgramada.ts';
import type { ConnectionPool } from 'mssql';
import type { CompareProgData, Room } from '../../types';
import type { Dayjs } from 'dayjs';

// data = {added[Objects], modified[Objects], deleted[Objects]}
const updateProgramada = async (
  pool: ConnectionPool,
  room: Room,
  data: CompareProgData,
  date: Dayjs
) => {
  // data.added should technically be empty, but in case it isn't
  await insertProgramada(pool, data.added, room, 'inserted', date);
  await insertProgramada(pool, data.modified, room, 'inserted', date);
  await insertProgramada(pool, data.deleted, room, 'deleted', date);
};

export default updateProgramada;
