import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';
import type { ColorCode } from '../../types';

type ColorCodes = Promise<
  IResult<Pick<ColorCode, 'Articulo' | 'Talle' | 'Color'>>
>;

async function getArticuloByStyleCode(
  pool: ConnectionPool,
  styleCode: string
): ColorCodes {
  return pool.request().input('styleCode', sql.Char(8), styleCode).query(`
    SELECT Articulo, Talle, Color
    FROM APP_COLOR_CODES
    WHERE StyleCode = @styleCode;
  `);
}

export default getArticuloByStyleCode;
