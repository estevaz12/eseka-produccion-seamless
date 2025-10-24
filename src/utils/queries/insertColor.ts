import type { ConnectionPool, IResult } from 'mssql';
import sql from 'mssql';

type ColorInsert = Promise<IResult<any>>;

async function insertColor(
  pool: ConnectionPool,
  data: { color: string }
): ColorInsert {
  return pool.request().input('color', sql.VarChar(50), data.color).query(`
    INSERT INTO APP_COLORES (Color)
      VALUES (@color);
  `);
}

export default insertColor;
