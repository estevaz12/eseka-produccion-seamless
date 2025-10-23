import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';
import type { ColorCode } from '../../types';

async function getArticuloByStyleCode(
  pool: ConnectionPool,
  styleCode: string
): Promise<IResult<ColorCode>> {
  return pool.request().input('styleCode', sql.Char(8), styleCode).query(`
    SELECT *
    FROM APP_COLOR_CODES
    WHERE StyleCode = @styleCode;
  `);
}

export default getArticuloByStyleCode;
