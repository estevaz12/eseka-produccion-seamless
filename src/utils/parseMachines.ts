import type { ConnectionPool } from 'mssql';
import type { Machine, MachineParsed, Room } from '../types';
import parseStyleCode from './parseStyleCode';

// Machines: [{MachCode, StyleCode: {styleCode, articulo, talle, color, colorId}, ...}]
async function parseMachines(pool: ConnectionPool, machines: Machine[]) {
  return await Promise.all(
    machines.map(async (m) => {
      const parsedStyleCode = await parseStyleCode(
        pool,
        m.RoomCode.trim() as Room,
        m.StyleCode.trim()
      );

      const parsedMachine: MachineParsed = {
        ...m,
        StyleCode: { ...parsedStyleCode },
      };

      return parsedMachine;
    })
  );
}

export default parseMachines;
