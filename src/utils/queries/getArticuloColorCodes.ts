import sql from 'mssql';
import type { ConnectionPool, IResult } from 'mssql';
import type { ColorCode } from '../../types';

type ColorCodes = Promise<IResult<ColorCode>>;

async function getArticuloColorCodes(
  pool: ConnectionPool,
  articulo: number
): ColorCodes {
  return pool.request().input('articulo', sql.Numeric(7, 2), Number(articulo))
    .query(`
    SELECT *
    FROM APP_COLOR_CODES
    WHERE Articulo = @articulo;
  `);
}

export default getArticuloColorCodes;
